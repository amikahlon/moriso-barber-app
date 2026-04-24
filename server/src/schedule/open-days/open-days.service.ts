import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { open_days, custom_day_hours } from '@prisma/client';

@Injectable()
export class OpenDaysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<open_days[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.open_days.findMany({
      where: { date: { gte: today } },
      orderBy: { date: 'asc' },
      include: {
        custom_day_hours: true,
        blocked_time_ranges: true,
      },
    });
  }

  async findOne(id: string): Promise<open_days> {
    const day = await this.prisma.open_days.findUnique({
      where: { id },
      include: {
        custom_day_hours: true,
        blocked_time_ranges: true,
      },
    });
    if (!day) throw new NotFoundException('יום לא נמצא');
    return day;
  }

  async findByDate(date: Date): Promise<open_days | null> {
    return this.prisma.open_days.findUnique({
      where: { date },
      include: {
        custom_day_hours: true,
        blocked_time_ranges: true,
      },
    });
  }

  async create(date: Date): Promise<open_days> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      throw new BadRequestException('לא ניתן לפתוח יום שכבר עבר');
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 365);
    if (date > maxDate) {
      throw new BadRequestException('לא ניתן לפתוח יום ביותר מ-365 ימים קדימה');
    }

    const existing = await this.findByDate(date);
    if (existing) {
      throw new ConflictException('היום הזה כבר פתוח לקביעת תורים');
    }

    return this.prisma.open_days.create({ data: { date } });
  }

  async remove(id: string): Promise<void> {
    const day = await this.findOne(id);

    const activeBookings = await this.prisma.bookings.count({
      where: { booking_date: day.date, status: 'active' },
    });

    if (activeBookings > 0) {
      throw new ConflictException(
        `לא ניתן לסגור יום שיש בו ${activeBookings} תורים פעילים — בטל אותם תחילה`,
      );
    }

    await this.prisma.open_days.delete({ where: { id } });
  }

  async createCustomDayHours(
    openDayId: string,
    startTime: string,
    endTime: string,
  ): Promise<custom_day_hours> {
    const startMinutes = this.timeStringToMinutes(startTime);
    const endMinutes = this.timeStringToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('שעת סיום חייבת להיות אחרי שעת התחלה');
    }

    const existingHours = await this.prisma.custom_day_hours.findMany({
      where: { open_day_id: openDayId },
    });

    const hasOverlap = existingHours.some((existing) => {
      const existStart = this.timeToMinutes(existing.start_time);
      const existEnd = this.timeToMinutes(existing.end_time);
      return startMinutes < existEnd && endMinutes > existStart;
    });

    if (hasOverlap) {
      throw new ConflictException('קיימת חפיפה עם טווח שעות קיים ביום זה');
    }

    const openDay = await this.prisma.open_days.findUnique({
      where: { id: openDayId },
    });
    if (!openDay) throw new NotFoundException('יום לא נמצא');

    const activeBookings = await this.prisma.bookings.findMany({
      where: { booking_date: openDay.date, status: 'active' },
      select: { start_time: true, end_time: true },
    });

    const bookingsOutsideNewHours = activeBookings.filter((booking) => {
      const bookingStart = this.timeToMinutes(booking.start_time);
      const bookingEnd = this.timeToMinutes(booking.end_time);
      return bookingStart < startMinutes || bookingEnd > endMinutes;
    });

    if (bookingsOutsideNewHours.length > 0) {
      throw new ConflictException(
        `יש ${bookingsOutsideNewHours.length} תורים פעילים מחוץ לשעות החדשות — בטל אותם תחילה`,
      );
    }

    return this.prisma.custom_day_hours.create({
      data: {
        open_day_id: openDayId,
        start_time: new Date(`1970-01-01T${startTime}:00.000Z`),
        end_time: new Date(`1970-01-01T${endTime}:00.000Z`),
      },
    });
  }

  private timeStringToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private timeToMinutes(time: Date): number {
    return time.getUTCHours() * 60 + time.getUTCMinutes();
  }
}
