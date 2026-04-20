import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDefaultHoursDto } from './create-default-hours.dto';
import type { default_hours } from '@prisma/client';

@Injectable()
export class DefaultHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<default_hours[]> {
    return this.prisma.default_hours.findMany({
      orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }],
    });
  }

  async findByDayOfWeek(dayOfWeek: number | null): Promise<default_hours[]> {
    return this.prisma.default_hours.findMany({
      where: { day_of_week: dayOfWeek },
      orderBy: { start_time: 'asc' },
    });
  }

  async create(dto: CreateDefaultHoursDto): Promise<default_hours> {
    const startMinutes = this.timeStringToMinutes(dto.startTime);
    const endMinutes = this.timeStringToMinutes(dto.endTime);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('שעת סיום חייבת להיות אחרי שעת התחלה');
    }

    const existingHours = await this.findByDayOfWeek(dto.dayOfWeek ?? null);
    const hasOverlap = existingHours.some((existing) => {
      const existStart = this.timeToMinutes(existing.start_time);
      const existEnd = this.timeToMinutes(existing.end_time);
      return startMinutes < existEnd && endMinutes > existStart;
    });

    if (hasOverlap) {
      throw new ConflictException(
        `קיימת חפיפה עם טווח שעות קיים ביום ${dto.dayOfWeek ?? 'גלובלי'}`,
      );
    }

    return this.prisma.default_hours.create({
      data: {
        day_of_week: dto.dayOfWeek ?? null,
        start_time: new Date(`1970-01-01T${dto.startTime}:00.000Z`),
        end_time: new Date(`1970-01-01T${dto.endTime}:00.000Z`),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.default_hours.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('שעות ברירת מחדל לא נמצאו');
    await this.prisma.default_hours.delete({ where: { id } });
  }

  private timeStringToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private timeToMinutes(time: Date): number {
    return time.getUTCHours() * 60 + time.getUTCMinutes();
  }
}
