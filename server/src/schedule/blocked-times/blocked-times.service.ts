import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlockedTimeDto } from './create-blocked-time.dto';
import type { blocked_time_ranges } from '@prisma/client';

interface TimeRange {
  start_time: Date;
  end_time: Date;
}

@Injectable()
export class BlockedTimesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBlockedTimeDto): Promise<blocked_time_ranges> {
    const startMinutes = this.timeStringToMinutes(dto.startTime);
    const endMinutes = this.timeStringToMinutes(dto.endTime);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('שעת סיום חייבת להיות אחרי שעת התחלה');
    }

    const openDay = await this.prisma.open_days.findUnique({
      where: { id: dto.openDayId },
      include: { custom_day_hours: true },
    });

    if (!openDay) throw new NotFoundException('היום לא נמצא');

    let workingRanges: TimeRange[] = [];

    if (openDay.custom_day_hours.length > 0) {
      workingRanges = openDay.custom_day_hours;
    } else {
      workingRanges = await this.prisma.default_hours.findMany({
        where: { day_of_week: openDay.date.getDay() + 1 },
      });
    }

    if (workingRanges.length === 0) {
      throw new BadRequestException('אין שעות עבודה מוגדרות ליום זה');
    }

    const isInsideWorkingHours = workingRanges.some((hours) => {
      const hoursStart = this.timeToMinutes(hours.start_time);
      const hoursEnd = this.timeToMinutes(hours.end_time);
      return startMinutes >= hoursStart && endMinutes <= hoursEnd;
    });

    if (!isInsideWorkingHours) {
      throw new BadRequestException('החסימה חייבת להיות בתוך שעות העבודה');
    }

    return this.prisma.blocked_time_ranges.create({
      data: {
        open_day_id: dto.openDayId,
        start_time: new Date(`1970-01-01T${dto.startTime}:00.000Z`),
        end_time: new Date(`1970-01-01T${dto.endTime}:00.000Z`),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.blocked_time_ranges.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('חסימה לא נמצאה');
    await this.prisma.blocked_time_ranges.delete({ where: { id } });
  }

  private timeStringToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private timeToMinutes(time: Date): number {
    return time.getUTCHours() * 60 + time.getUTCMinutes();
  }
}
