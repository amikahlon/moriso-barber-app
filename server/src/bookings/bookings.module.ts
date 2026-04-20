import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ScheduleModule } from '../schedule/schedule.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ScheduleModule, SettingsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
