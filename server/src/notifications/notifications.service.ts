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
  async sendToAdmin(title: string, body: string): Promise<void> {
    const tokens = await this.prisma.push_tokens.findMany({
      where: { users: { role: 'admin' } },
      select: { device_token: true },
    });

    if (tokens.length === 0) return;

    const messages: PushMessage[] = tokens.map((t) => ({
      to: t.device_token,
      title,
      body,
    }));

    await this.sendToExpo(messages);
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
  }

  /** שלח הודעות ל-Expo Push API */
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
            `Push notification failed for token ${index}: ${item.message ?? 'unknown error'}`,
          );
        }
      });
    } catch (error) {
      this.logger.error('Failed to send push notifications', error);
    }
  }
}
