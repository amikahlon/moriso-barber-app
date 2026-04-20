import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateOpenDayDto } from './open-days/create-open-day.dto';
import { CreateDefaultHoursDto } from './default-hours/create-default-hours.dto';
import { CreateBlockedTimeDto } from './blocked-times/create-blocked-time.dto';
import { CreateCustomDayHoursDto } from './default-hours/create-custom-day-hours.dto';
import { JwtAuthGuard, RolesGuard, Roles, ParseUuidPipe } from '../common';

@ApiTags('schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // ─── Open Days ───────────────────────────────────────────

  @Get('open-days')
  @ApiOperation({ summary: 'כל הימים הפתוחים' })
  findAllOpenDays() {
    return this.scheduleService.findAllOpenDays();
  }

  @Post('open-days')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'פתיחת יום — אדמין בלבד' })
  createOpenDay(@Body() dto: CreateOpenDayDto) {
    return this.scheduleService.createOpenDay(dto);
  }

  @Delete('open-days/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'סגירת יום — אדמין בלבד' })
  removeOpenDay(@Param('id', ParseUuidPipe) id: string) {
    return this.scheduleService.removeOpenDay(id);
  }

  // ─── Default Hours ────────────────────────────────────────

  @Get('default-hours')
  @ApiOperation({ summary: 'שעות ברירת מחדל' })
  findAllDefaultHours() {
    return this.scheduleService.findAllDefaultHours();
  }

  @Post('default-hours')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'הוספת שעות ברירת מחדל — אדמין בלבד' })
  createDefaultHours(@Body() dto: CreateDefaultHoursDto) {
    return this.scheduleService.createDefaultHours(dto);
  }

  @Delete('default-hours/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'מחיקת שעות ברירת מחדל — אדמין בלבד' })
  removeDefaultHours(@Param('id', ParseUuidPipe) id: string) {
    return this.scheduleService.removeDefaultHours(id);
  }

  // ─── Custom Day Hours ─────────────────────────────────────

  @Post('custom-day-hours')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'שעות מותאמות ליום ספציפי — אדמין בלבד' })
  createCustomDayHours(@Body() dto: CreateCustomDayHoursDto) {
    return this.scheduleService.createCustomDayHours(dto);
  }

  @Delete('custom-day-hours/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'מחיקת שעות מותאמות — אדמין בלבד' })
  removeCustomDayHours(@Param('id', ParseUuidPipe) id: string) {
    return this.scheduleService.removeCustomDayHours(id);
  }

  // ─── Blocked Times ────────────────────────────────────────

  @Post('blocked-times')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'חסימת שעה — אדמין בלבד' })
  createBlockedTime(@Body() dto: CreateBlockedTimeDto) {
    return this.scheduleService.createBlockedTime(dto);
  }

  @Delete('blocked-times/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'ביטול חסימה — אדמין בלבד' })
  removeBlockedTime(@Param('id', ParseUuidPipe) id: string) {
    return this.scheduleService.removeBlockedTime(id);
  }

  // ─── Slots ────────────────────────────────────────────────

  @Get('slots')
  @ApiOperation({ summary: 'slots פנויים לתאריך ושירות' })
  @ApiQuery({ name: 'date', required: true, example: '2026-05-01' })
  @ApiQuery({ name: 'serviceDuration', required: true, example: 30 })
  getAvailableSlots(
    @Query('date') date: string,
    @Query('serviceDuration') serviceDuration: string,
  ) {
    return this.scheduleService.getAvailableSlots(
      new Date(date),
      parseInt(serviceDuration),
    );
  }
}
