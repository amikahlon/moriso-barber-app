import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../../settings/settings.service';
import { DefaultHoursService } from '../default-hours/default-hours.service';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

@Injectable()
export class SlotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly defaultHours: DefaultHoursService,
  ) {}

  /**
   * מחזיר את כל ה-slots ליום מסוים לפי משך הטיפול
   * שולף שעות עבודה, מוריד חסימות ותורים תפוסים
   */
  async getAvailableSlots(
    date: Date,
    serviceDurationMinutes: number,
  ): Promise<TimeSlot[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return [];

    const openDay = await this.prisma.open_days.findUnique({
      where: { date },
      include: {
        custom_day_hours: true,
        blocked_time_ranges: true,
      },
    });

    if (!openDay) return [];

    const businessSettings = await this.settings.get();
    const slotInterval = businessSettings.slot_interval_minutes;
    const businessTimeZone = businessSettings.timezone ?? 'Asia/Jerusalem';
    const isRequestedDateToday = this.isTodayInTimeZone(date, businessTimeZone);
    const nowMinutes = isRequestedDateToday
      ? this.getNowMinutesInTimeZone(businessTimeZone)
      : -1;

    // custom שעות דורסות את ה-default
    const workingHours =
      openDay.custom_day_hours.length > 0
        ? openDay.custom_day_hours
        : await this.defaultHours.findByDayOfWeek(date.getDay() + 1);

    if (workingHours.length === 0) return [];

    // שלוף תורים תפוסים לאותו יום
    const existingBookings = await this.prisma.bookings.findMany({
      where: { booking_date: date, status: 'active' },
      select: { start_time: true, end_time: true },
    });

    const slots: TimeSlot[] = [];

    // בנה slots לכל טווח שעות
    for (const hours of workingHours) {
      const startMinutes = this.timeToMinutes(hours.start_time);
      const endMinutes = this.timeToMinutes(hours.end_time);

      for (
        let current = startMinutes;
        current + serviceDurationMinutes <= endMinutes;
        current += slotInterval
      ) {
        if (isRequestedDateToday && current < nowMinutes) {
          continue;
        }

        const slotEnd = current + serviceDurationMinutes;

        // בדוק חפיפה עם חסימות
        const isBlocked = openDay.blocked_time_ranges.some((block) => {
          const blockStart = this.timeToMinutes(block.start_time);
          const blockEnd = this.timeToMinutes(block.end_time);
          return current < blockEnd && slotEnd > blockStart;
        });

        // בדוק חפיפה עם תורים קיימים
        const isTaken = existingBookings.some((booking) => {
          const bookingStart = this.timeToMinutes(booking.start_time);
          const bookingEnd = this.timeToMinutes(booking.end_time);
          return current < bookingEnd && slotEnd > bookingStart;
        });

        slots.push({
          startTime: this.minutesToTime(current),
          endTime: this.minutesToTime(slotEnd),
          isAvailable: !isBlocked && !isTaken,
        });
      }
    }

    return slots;
  }

  /** המר Date של Prisma לדקות — UTC כדי לא לתלות בtimezone */
  private timeToMinutes(time: Date): number {
    return time.getUTCHours() * 60 + time.getUTCMinutes();
  }

  /** המר דקות לפורמט HH:MM */
  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private isTodayInTimeZone(date: Date, timeZone: string): boolean {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return formatter.format(date) === formatter.format(new Date());
  }

  private getNowMinutesInTimeZone(timeZone: string): number {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(new Date());
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
    const minute = Number(
      parts.find((part) => part.type === 'minute')?.value ?? 0,
    );

    return hour * 60 + minute;
  }
}
