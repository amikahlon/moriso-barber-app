import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsCron {
  private readonly logger = new Logger(NotificationsCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * כל 60 דקות — בדוק תורים שמתחילים בעוד שעה ושלח תזכורת
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendBookingReminders(): Promise<void> {
    this.logger.log('בודק תורים לתזכורת...');

    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    // שלוף תורים שמתחילים בדיוק בעוד שעה
    const bookings = await this.prisma.bookings.findMany({
      where: {
        status: 'active',
        booking_date: {
          gte: new Date(now.toISOString().split('T')[0]),
        },
      },
      include: {
        users: { select: { id: true, full_name: true } },
        services: { select: { name: true } },
      },
    });

    // סנן תורים שמתחילים בעוד ~60 דקות
    const upcomingBookings = bookings.filter((booking) => {
      const bookingHour = booking.start_time.getUTCHours();
      const bookingMinutes = booking.start_time.getUTCMinutes();
      const bookingTotalMinutes = bookingHour * 60 + bookingMinutes;

      const inOneHourTotalMinutes =
        inOneHour.getUTCHours() * 60 + inOneHour.getUTCMinutes();

      return Math.abs(bookingTotalMinutes - inOneHourTotalMinutes) < 5;
    });

    this.logger.log(`נמצאו ${upcomingBookings.length} תורים לתזכורת`);

    // שלח תזכורת לכל לקוח
    await Promise.all(
      upcomingBookings.map((booking) =>
        this.notifications.sendToUser(
          booking.users.id,
          'תזכורת תור 🕐',
          `יש לך תור ל${booking.services.name} בעוד שעה`,
          { bookingId: booking.id },
        ),
      ),
    );
  }

  /**
   * כל יום בחצות — שלח ברכת יום הולדת ללקוחות שנולדו היום
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendBirthdayGreetings(): Promise<void> {
    this.logger.log('בודק ימי הולדת...');

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // שלוף לקוחות שנולדו היום
    const users = await this.prisma.users.findMany({
      where: {
        role: 'customer',
        birth_date: {
          not: null,
        },
      },
    });

    const birthdayUsers = users.filter((user) => {
      if (!user.birth_date) return false;
      return (
        user.birth_date.getMonth() + 1 === month &&
        user.birth_date.getDate() === day
      );
    });

    this.logger.log(`נמצאו ${birthdayUsers.length} ימי הולדת היום`);

    await Promise.all(
      birthdayUsers.map((user) =>
        this.notifications.sendToUser(
          user.id,
          ' יום הולדת שמח!',
          `${user.full_name}, המספרה מאחלת לך יום הולדת שמח!`,
        ),
      ),
    );
  }
}
