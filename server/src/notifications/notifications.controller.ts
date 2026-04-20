import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendBroadcastDto } from './dto/send-broadcast.dto';
import { JwtAuthGuard, RolesGuard, Roles, ParseUuidPipe } from '../common';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** שלח הודעה לכל הלקוחות */
  @Post('broadcast')
  @ApiOperation({ summary: 'שלח הודעה לכל הלקוחות — אדמין בלבד' })
  sendBroadcast(@Body() dto: SendBroadcastDto): Promise<void> {
    return this.notificationsService.sendBroadcast(dto.title, dto.body);
  }

  /** שלח הודעה ללקוח ספציפי */
  @Post('send/:userId')
  @ApiOperation({ summary: 'שלח הודעה ללקוח ספציפי — אדמין בלבד' })
  sendToUser(
    @Param('userId', ParseUuidPipe) userId: string,
    @Body() dto: SendBroadcastDto,
  ): Promise<void> {
    return this.notificationsService.sendToUser(userId, dto.title, dto.body);
  }
}
