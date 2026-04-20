import {
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-service' })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'פורמט שגוי — HH:MM' })
  startTime!: string;

  @ApiPropertyOptional({ example: 'מעדיף תספורת קצרה בצדדים' })
  @IsOptional()
  @IsString()
  notes?: string;
}
