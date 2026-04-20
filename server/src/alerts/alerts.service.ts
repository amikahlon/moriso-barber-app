import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import type { alerts } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  /** כל ה-alerts הפעילים — ללקוחות */
  async findActive(): Promise<alerts[]> {
    const now = new Date();
    return this.prisma.alerts.findMany({
      where: {
        is_active: true,
        OR: [{ expires_at: null }, { expires_at: { gt: now } }],
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /** כל ה-alerts — לאדמין */
  async findAll(): Promise<alerts[]> {
    return this.prisma.alerts.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  /** יצירת alert חדש */
  async create(dto: CreateAlertDto): Promise<alerts> {
    return this.prisma.alerts.create({
      data: {
        title: dto.title,
        body: dto.body,
        is_active: dto.isActive ?? true,
        expires_at: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  /** עדכון alert */
  async update(id: string, dto: UpdateAlertDto): Promise<alerts> {
    const existing = await this.prisma.alerts.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('התראה לא נמצאה');

    return this.prisma.alerts.update({
      where: { id },
      data: {
        title: dto.title,
        body: dto.body,
        is_active: dto.isActive,
        expires_at: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  /** מחיקת alert */
  async remove(id: string): Promise<void> {
    const existing = await this.prisma.alerts.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('התראה לא נמצאה');
    await this.prisma.alerts.delete({ where: { id } });
  }
}
