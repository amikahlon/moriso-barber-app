import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMultipleOf15 } from '../../common';

export class CreateServiceDto {
  @ApiProperty({ example: 'תספורת' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(15)
  @Validate(IsMultipleOf15)
  durationMinutes!: number;

  @ApiPropertyOptional({ example: 'תספורת קלאסית' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
