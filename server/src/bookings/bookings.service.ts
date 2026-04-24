import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { SlotsService } from '../schedule/slots/slots.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { bookings } from '@prisma/client';

const MAX_ACTIVE_BOOKINGS_PER_CUSTOMER = 5;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly slots: SlotsService,
  ) {}

  /** כל התורים — לאדמין */
  async findAll(): Promise<bookings[]> {
    return this.prisma.bookings.findMany({
      orderBy: [{ booking_date: 'asc' }, { start_time: 'asc' }],
      include: {
        users: {
          select: { id: true, full_name: true, phone: true, email: true },
        },
        services: { select: { id: true, name: true, duration_minutes: true } },
      },
    });
  }

  /** תורים של יום מסוים — לאדמין */
  async findByDate(date: Date): Promise<bookings[]> {
    return this.prisma.bookings.findMany({
      where: { booking_date: date, status: 'active' },
      orderBy: { start_time: 'asc' },
      include: {
        users: { select: { id: true, full_name: true, phone: true } },
        services: { select: { id: true, name: true, duration_minutes: true } },
      },
    });
  }

  /** כל התורים הפעילים של לקוח */
  async findActiveByCustomer(customerId: string): Promise<bookings[]> {
    return this.prisma.bookings.findMany({
      where: { customer_id: customerId, status: 'active' },
      orderBy: [{ booking_date: 'asc' }, { start_time: 'asc' }],
      include: {
        services: true,
        open_days: true,
      },
    });
  }

  /**
   * קביעת תור חדש
   * בודק: הלקוח לא חרג ממכסת תורים פעילים, היום פתוח, ה-slot פנוי
   */
  async create(customerId: string, dto: CreateBookingDto): Promise<bookings> {
    const activeBookingsCount = await this.prisma.bookings.count({
      where: { customer_id: customerId, status: 'active' },
    });

    if (activeBookingsCount >= MAX_ACTIVE_BOOKINGS_PER_CUSTOMER) {
      throw new ConflictException(
        `ניתן לקבוע עד ${MAX_ACTIVE_BOOKINGS_PER_CUSTOMER} תורים פעילים בלבד`,
      );
    }

    // שלוף שירות
    const service = await this.prisma.services.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) throw new NotFoundException('שירות לא נמצא');
    if (!service.is_active) throw new BadRequestException('השירות אינו פעיל');

    const bookingDate = new Date(dto.date);

    // בדוק שהיום פתוח
    const openDay = await this.prisma.open_days.findUnique({
      where: { date: bookingDate },
    });
    if (!openDay) throw new BadRequestException('היום לא פתוח לקביעת תורים');

    // בדוק ש-slot פנוי
    const availableSlots = await this.slots.getAvailableSlots(
      bookingDate,
      service.duration_minutes,
    );

    const requestedSlot = availableSlots.find(
      (slot) => slot.startTime === dto.startTime && slot.isAvailable,
    );

    if (!requestedSlot) {
      throw new ConflictException('השעה המבוקשת אינה פנויה');
    }

    return this.prisma.bookings.create({
      data: {
        customer_id: customerId,
        service_id: dto.serviceId,
        booking_date: bookingDate,
        start_time: new Date(`1970-01-01T${dto.startTime}:00.000Z`),
        end_time: new Date(`1970-01-01T${requestedSlot.endTime}:00.000Z`),
        status: 'active',
        notes: dto.notes,
        service_price_snapshot: service.price,
        open_day_id: openDay.id,
      },
    });
  }

  /**
   * ביטול תור
   * בודק: זמן ביטול מינימלי לא עבר (רק ללקוח)
   */
  async cancel(
    bookingId: string,
    cancelledBy: 'customer' | 'admin',
  ): Promise<bookings> {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException('תור לא נמצא');
    if (booking.status !== 'active')
      throw new BadRequestException('התור כבר בוטל');

    // בדוק זמן ביטול מינימלי — רק ללקוח
    if (cancelledBy === 'customer') {
      const businessSettings = await this.settings.get();
      const minNoticeMinutes = businessSettings.min_cancel_notice_minutes;

      const bookingDateTime = new Date(
        `${booking.booking_date.toISOString().split('T')[0]}T${booking.start_time.toISOString().split('T')[1]}`,
      );
      const minutesUntilBooking =
        (bookingDateTime.getTime() - Date.now()) / 60000;

      if (minutesUntilBooking < minNoticeMinutes) {
        throw new BadRequestException(
          `לא ניתן לבטל פחות מ-${minNoticeMinutes} דקות לפני התור`,
        );
      }
    }

    return this.prisma.bookings.update({
      where: { id: bookingId },
      data: {
        status:
          cancelledBy === 'customer'
            ? 'cancelled_by_customer'
            : 'cancelled_by_admin',
        cancelled_by: cancelledBy,
        cancelled_at: new Date(),
      },
    });
  }
}
