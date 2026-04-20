import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { SlotsService } from './slots/slots.service';
import { OpenDaysService } from './open-days/open-days.service';
import { DefaultHoursService } from './default-hours/default-hours.service';
import { BlockedTimesService } from './blocked-times/blocked-times.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    SlotsService,
    OpenDaysService,
    DefaultHoursService,
    BlockedTimesService,
  ],
  exports: [ScheduleService, SlotsService],
})
export class ScheduleModule {}
