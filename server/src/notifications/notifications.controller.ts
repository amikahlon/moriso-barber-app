import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendBroadcastDto } from './dto/send-broadcast.dto';
import { PushTokenDto } from './dto/push-token.dto';
import {
  JwtAuthGuard,
  RolesGuard,
  Roles,
  ParseUuidPipe,
  CurrentUser,
} from '../common';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ─── Token ──────────────────────────────────────────────────

  /** שמור טוקן למשתמש המחובר */
  @Post('push-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'שמור push token למשתמש המחובר' })
  registerToken(
    @CurrentUser() user: { id: string },
    @Body() dto: PushTokenDto,
  ): Promise<void> {
    return this.notificationsService.registerToken(
      user.id,
      dto.token,
      dto.platform,
    );
  }

  /** מחק טוקן בהתנתקות */
  @Delete('push-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'מחק push token בהתנתקות' })
  removeToken(
    @CurrentUser() user: { id: string },
    @Body() dto: PushTokenDto,
  ): Promise<void> {
    return this.notificationsService.removeToken(user.id, dto.token);
  }

  // ─── Admin Only ──────────────────────────────────────────────

  /** כל המשתמשים עם הטוקנים שלהם */
  @Get('tokens')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'כל המשתמשים עם הטוקנים — אדמין בלבד' })
  getUsersWithTokens() {
    return this.notificationsService.getUsersWithTokens();
  }

  /** Broadcast לכל הלקוחות */
  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'שלח הודעה לכל הלקוחות — אדמין בלבד' })
  sendBroadcast(@Body() dto: SendBroadcastDto): Promise<void> {
    return this.notificationsService.sendBroadcast(dto.title, dto.body);
  }

  /** שלח לכל האדמינים */
  @Post('send-to-admins')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'שלח הודעה לכל האדמינים — אדמין בלבד' })
  sendToAdmins(@Body() dto: SendBroadcastDto): Promise<void> {
    return this.notificationsService.sendToAdmins(dto.title, dto.body);
  }

  /** שלח ללקוח ספציפי */
  @Post('send/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'שלח הודעה ללקוח ספציפי — אדמין בלבד' })
  sendToUser(
    @Param('userId', ParseUuidPipe) userId: string,
    @Body() dto: SendBroadcastDto,
  ): Promise<void> {
    return this.notificationsService.sendToUser(userId, dto.title, dto.body);
  }
}
