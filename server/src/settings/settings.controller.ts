import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../common';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'קבלת הגדרות העסק' })
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'עדכון הגדרות העסק — אדמין בלבד' })
  upsert(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.upsert(dto);
  }
}
