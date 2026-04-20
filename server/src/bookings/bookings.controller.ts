import {
  Controller,
  Get,
  Post,
  Patch,
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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  JwtAuthGuard,
  RolesGuard,
  Roles,
  CurrentUser,
  ParseUuidPipe,
} from '../common';
import type { users } from '@prisma/client';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** כל התורים — אדמין בלבד */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'כל התורים — אדמין בלבד' })
  findAll() {
    return this.bookingsService.findAll();
  }

  /** תורים לפי תאריך — אדמין בלבד */
  @Get('by-date')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'תורים לפי תאריך — אדמין בלבד' })
  @ApiQuery({ name: 'date', required: true, example: '2026-05-01' })
  findByDate(@Query('date') date: string) {
    return this.bookingsService.findByDate(new Date(date));
  }

  /** התור הפעיל של הלקוח המחובר */
  @Get('my')
  @ApiOperation({ summary: 'התור הפעיל שלי' })
  findMyBooking(@CurrentUser() user: users) {
    return this.bookingsService.findActiveByCustomer(user.id);
  }

  /** קביעת תור */
  @Post()
  @ApiOperation({ summary: 'קביעת תור' })
  create(@CurrentUser() user: users, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  /** ביטול תור על ידי לקוח */
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'ביטול תור על ידי לקוח' })
  cancelByCustomer(@Param('id', ParseUuidPipe) id: string) {
    return this.bookingsService.cancel(id, 'customer');
  }

  /** ביטול תור על ידי אדמין */
  @Patch(':id/cancel-by-admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'ביטול תור על ידי אדמין' })
  cancelByAdmin(@Param('id', ParseUuidPipe) id: string) {
    return this.bookingsService.cancel(id, 'admin');
  }
}
