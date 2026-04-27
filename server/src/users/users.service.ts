import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
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

  /** כל המשתמשים — לאדמין */
  async findAll(): Promise<users[]> {
    return this.prisma.users.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  /** משתמש לפי ID */
  async findOne(id: string): Promise<users> {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('משתמש לא נמצא');
    return user;
  }

  /** עדכון פרופיל */
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

  /** מחיקת משתמש — כולל כל הנתונים הקשורים אליו */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    // Delete all dependent records atomically before removing the user.
    // bookings and push_tokens are defined with onDelete: NoAction so they
    // must be deleted explicitly; a failed step rolls back the entire operation.
    await this.prisma.$transaction([
      this.prisma.push_tokens.deleteMany({ where: { user_id: id } }),
      this.prisma.bookings.deleteMany({ where: { customer_id: id } }),
      this.prisma.users.delete({ where: { id } }),
    ]);

    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error)
      throw new Error(`שגיאה במחיקת משתמש מ-Supabase Auth: ${error.message}`);
  }

  /**
   * רישום push token למכשיר
   * upsert — אם קיים מעדכן, אם לא יוצר חדש
   */
  async registerPushToken(
    userId: string,
    dto: RegisterPushTokenDto,
  ): Promise<void> {
    await this.prisma.push_tokens.upsert({
      where: { device_token: dto.deviceToken },
      update: {
        user_id: userId,
        last_used_at: new Date(),
      },
      create: {
        user_id: userId,
        device_token: dto.deviceToken,
        platform: dto.platform,
      },
    });
  }
}
