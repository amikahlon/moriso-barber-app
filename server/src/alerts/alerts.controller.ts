import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { JwtAuthGuard, RolesGuard, Roles, ParseUuidPipe } from '../common';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /** כל ה-alerts הפעילים — פתוח */
  @Get('active')
  @ApiOperation({ summary: 'alerts פעילים' })
  findActive() {
    return this.alertsService.findActive();
  }

  /** כל ה-alerts — אדמין בלבד */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'כל ה-alerts — אדמין בלבד' })
  findAll() {
    return this.alertsService.findAll();
  }

  /** יצירת alert — אדמין בלבד */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'יצירת alert — אדמין בלבד' })
  create(@Body() dto: CreateAlertDto) {
    return this.alertsService.create(dto);
  }

  /** עדכון alert — אדמין בלבד */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'עדכון alert — אדמין בלבד' })
  update(@Param('id', ParseUuidPipe) id: string, @Body() dto: UpdateAlertDto) {
    return this.alertsService.update(id, dto);
  }

  /** מחיקת alert — אדמין בלבד */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'מחיקת alert — אדמין בלבד' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.alertsService.remove(id);
  }
}
