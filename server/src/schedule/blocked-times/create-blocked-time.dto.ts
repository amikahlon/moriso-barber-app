import { IsString, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlockedTimeDto {
  @ApiProperty({ example: 'uuid-of-open-day' })
  @IsUUID()
  openDayId!: string;

  @ApiProperty({ example: '13:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'פורמט שגוי — HH:MM' })
  startTime!: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'פורמט שגוי — HH:MM' })
  endTime!: string;
}
