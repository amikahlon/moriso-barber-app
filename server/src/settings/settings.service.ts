import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import type { business_settings } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<business_settings> {
    const settings = await this.prisma.business_settings.findFirst();
    if (!settings) throw new NotFoundException('הגדרות עסק לא נמצאו');
    return settings;
  }

  async upsert(dto: UpdateSettingsDto): Promise<business_settings> {
    const existing = await this.prisma.business_settings.findFirst();

    if (existing) {
      return this.prisma.business_settings.update({
        where: { id: existing.id },
        data: {
          slot_interval_minutes: dto.slotIntervalMinutes,
          min_cancel_notice_minutes: dto.minCancelNoticeMinutes,
          timezone: dto.timezone,
          address: dto.address,
          google_maps_url: dto.googleMapsUrl,
          phone: dto.phone,
          is_booking_enabled: dto.isBookingEnabled,
          business_name: dto.businessName,
          instagram_url: dto.instagramUrl,
          facebook_url: dto.facebookUrl,
          logo_url: dto.logoUrl,
        },
      });
    }

    return this.prisma.business_settings.create({
      data: {
        slot_interval_minutes: dto.slotIntervalMinutes ?? 30,
        min_cancel_notice_minutes: dto.minCancelNoticeMinutes ?? 60,
        timezone: dto.timezone ?? 'Asia/Jerusalem',
        address: dto.address,
        google_maps_url: dto.googleMapsUrl,
        phone: dto.phone,
        is_booking_enabled: dto.isBookingEnabled ?? true,
        business_name: dto.businessName,
        instagram_url: dto.instagramUrl,
        facebook_url: dto.facebookUrl,
        logo_url: dto.logoUrl,
      },
    });
  }
}
