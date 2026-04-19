import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  Min,
  Validate,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMultipleOf15 } from '../../common';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'תספורת' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Validate(IsMultipleOf15)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'תספורת קלאסית' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
