import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import type { services } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive = false): Promise<services[]> {
    return this.prisma.services.findMany({
      where: onlyActive ? { is_active: true } : undefined,
      orderBy: { sort_order: 'asc' },
    });
  }

  async findOne(id: string): Promise<services> {
    const service = await this.prisma.services.findUnique({
      where: { id },
    });
    if (!service) throw new NotFoundException('שירות לא נמצא');
    return service;
  }

  async create(dto: CreateServiceDto): Promise<services> {
    return this.prisma.services.create({
      data: {
        name: dto.name,
        price: dto.price,
        duration_minutes: dto.durationMinutes,
        description: dto.description,
        sort_order: dto.sortOrder ?? 0,
        is_active: true,
      },
    });
  }

  async update(id: string, dto: UpdateServiceDto): Promise<services> {
    await this.findOne(id);
    return this.prisma.services.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        duration_minutes: dto.durationMinutes,
        description: dto.description,
        sort_order: dto.sortOrder,
        is_active: dto.isActive,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.services.delete({ where: { id } });
  }
}
