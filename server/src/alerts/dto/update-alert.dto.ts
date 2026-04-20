import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAlertDto {
  @ApiPropertyOptional({ example: 'סגור מחר' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'המספרה סגורה מחר בגלל חג' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-05-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
