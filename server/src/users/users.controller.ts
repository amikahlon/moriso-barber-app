import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  JwtAuthGuard,
  RolesGuard,
  Roles,
  CurrentUser,
  ParseUuidPipe,
} from '../common';
import type { users } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'פרופיל המשתמש המחובר' })
  getMe(@CurrentUser() user: users): users {
    return user;
  }

  @Patch('me')
  @ApiOperation({ summary: 'עדכון פרופיל' })
  updateMe(
    @CurrentUser() user: users,
    @Body() dto: UpdateUserDto,
  ): Promise<users> {
    return this.usersService.update(user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'כל המשתמשים — אדמין בלבד' })
  findAll(): Promise<users[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'משתמש לפי ID — אדמין בלבד' })
  findOne(@Param('id', ParseUuidPipe) id: string): Promise<users> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'מחיקת משתמש — אדמין בלבד' })
  remove(@Param('id', ParseUuidPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
