import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface ExpoResponse {
  data: { status: string; message?: string }[];
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly expoUrl = 'https://exp.host/--/api/v2/push/send';

  constructor(private readonly prisma: PrismaService) {}

  // ─── Token Management ───────────────────────────────────────

  /** שמור טוקן למשתמש — אם כבר קיים, דלג */
  async registerToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android',
  ): Promise<void> {
    const existing = await this.prisma.push_tokens.findFirst({
      where: { user_id: userId, device_token: token },
    });

    if (existing) return;

    await this.prisma.push_tokens.create({
      data: {
        user_id: userId,
        device_token: token,
        platform,
      },
    });

    this.logger.log(`Token registered for user ${userId} on ${platform}`);
  }

  /** מחק טוקן ספציפי — בהתנתקות */
  async removeToken(userId: string, token: string): Promise<void> {
    await this.prisma.push_tokens.deleteMany({
      where: { user_id: userId, device_token: token },
    });
  }

  /** שלוף כל המשתמשים עם הטוקנים שלהם */
  async getUsersWithTokens() {
    const tokens = await this.prisma.push_tokens.findMany({
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return tokens.map((t) => ({
      tokenId: t.id,
      token: t.device_token,
      userId: t.user_id,
      fullName: t.users.full_name,
      email: t.users.email,
      role: t.users.role,
      createdAt: t.created_at,
    }));
  }

  // ─── Send ────────────────────────────────────────────────────

  /** שלח notification למשתמש ספציפי לפי userId */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const tokens = await this.prisma.push_tokens.findMany({
      where: { user_id: userId },
      select: { device_token: true },
    });

    if (tokens.length === 0) return;

    const messages: PushMessage[] = tokens.map((t) => ({
      to: t.device_token,
      title,
      body,
      data,
    }));

    await this.sendToExpo(messages);
  }

  /** שלח notification לכל האדמינים */
  async sendToAdmins(
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const tokens = await this.prisma.push_tokens.findMany({
      where: { users: { role: 'admin' } },
      select: { device_token: true },
    });

    if (tokens.length === 0) return;

    const messages: PushMessage[] = tokens.map((t) => ({
      to: t.device_token,
      title,
      body,
      data,
    }));

    await this.sendToExpo(messages);
    this.logger.log(`Sent push to ${tokens.length} admins: ${title}`);
  }

  /** שלח broadcast לכל הלקוחות */
  async sendBroadcast(title: string, body: string): Promise<void> {
    const tokens = await this.prisma.push_tokens.findMany({
      where: { users: { role: 'customer' } },
      select: { device_token: true },
    });

    if (tokens.length === 0) return;

    const messages: PushMessage[] = tokens.map((t) => ({
      to: t.device_token,
      title,
      body,
    }));

    await this.sendToExpo(messages);
    this.logger.log(`Broadcast sent to ${tokens.length} customers`);
  }

  // ─── Expo ────────────────────────────────────────────────────

  private async sendToExpo(messages: PushMessage[]): Promise<void> {
    try {
      const response = await fetch(this.expoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = (await response.json()) as ExpoResponse;

      result.data?.forEach((item, index) => {
        if (item.status === 'error') {
          this.logger.warn(
            `Push failed for token ${index}: ${item.message ?? 'unknown'}`,
          );
        }
      });
    } catch (error) {
      this.logger.error('Failed to send push notifications', error);
    }
  }
}
