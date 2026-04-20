import { Injectable } from '@nestjs/common';
import { OpenDaysService } from './open-days/open-days.service';
import { DefaultHoursService } from './default-hours/default-hours.service';
import { BlockedTimesService } from './blocked-times/blocked-times.service';
import { SlotsService, TimeSlot } from './slots/slots.service';
import { CreateOpenDayDto } from './open-days/create-open-day.dto';
import { CreateDefaultHoursDto } from './default-hours/create-default-hours.dto';
import { CreateBlockedTimeDto } from './blocked-times/create-blocked-time.dto';
import { CreateCustomDayHoursDto } from './default-hours/create-custom-day-hours.dto';
import { PrismaService } from '../prisma/prisma.service';
import type {
  open_days,
  default_hours,
  blocked_time_ranges,
  custom_day_hours,
} from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly openDays: OpenDaysService,
    private readonly defaultHours: DefaultHoursService,
    private readonly blockedTimes: BlockedTimesService,
    private readonly slots: SlotsService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Open Days ───────────────────────────────────────────

  /** כל הימים הפתוחים */
  findAllOpenDays(): Promise<open_days[]> {
    return this.openDays.findAll();
  }

  /** פתח יום חדש */
  createOpenDay(dto: CreateOpenDayDto): Promise<open_days> {
    return this.openDays.create(new Date(dto.date));
  }

  /** סגור יום */
  removeOpenDay(id: string): Promise<void> {
    return this.openDays.remove(id);
  }

  // ─── Default Hours ────────────────────────────────────────

  /** כל שעות ברירת המחדל */
  findAllDefaultHours(): Promise<default_hours[]> {
    return this.defaultHours.findAll();
  }

  /** הוסף טווח שעות ברירת מחדל */
  createDefaultHours(dto: CreateDefaultHoursDto): Promise<default_hours> {
    return this.defaultHours.create(dto);
  }

  /** מחק טווח שעות ברירת מחדל */
  removeDefaultHours(id: string): Promise<void> {
    return this.defaultHours.remove(id);
  }

  // ─── Custom Day Hours ─────────────────────────────────────

  /** הוסף שעות מותאמות ליום ספציפי — דורסות את ה-default */
  async createCustomDayHours(
    dto: CreateCustomDayHoursDto,
  ): Promise<custom_day_hours> {
    return this.openDays.createCustomDayHours(
      dto.openDayId,
      dto.startTime,
      dto.endTime,
    );
  }

  /** מחק שעות מותאמות */
  async removeCustomDayHours(id: string): Promise<void> {
    await this.prisma.custom_day_hours.delete({ where: { id } });
  }

  // ─── Blocked Times ────────────────────────────────────────

  /** חסום שעה ספציפית */
  createBlockedTime(dto: CreateBlockedTimeDto): Promise<blocked_time_ranges> {
    return this.blockedTimes.create(dto);
  }

  /** בטל חסימה */
  removeBlockedTime(id: string): Promise<void> {
    return this.blockedTimes.remove(id);
  }

  // ─── Slots ────────────────────────────────────────────────

  /** slots פנויים לתאריך ומשך טיפול */
  getAvailableSlots(
    date: Date,
    serviceDurationMinutes: number,
  ): Promise<TimeSlot[]> {
    return this.slots.getAvailableSlots(date, serviceDurationMinutes);
  }
}
