import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { users } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly supabase: ReturnType<typeof createClient>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.supabase = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async findAll(): Promise<users[]> {
    return this.prisma.users.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string): Promise<users> {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('משתמש לא נמצא');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<users> {
    await this.findOne(id);
    return this.prisma.users.update({
      where: { id },
      data: {
        full_name: dto.fullName,
        phone: dto.phone,
        notes: dto.notes,
        birth_date: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    // מחיקה מהסופבייס אותנטיקטור מוחקת אוטומטי גם מהטבלת משתמשים
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error)
      throw new Error(`שגיאה במחיקת משתמש מ-Supabase: ${error.message}`);
  }
}
