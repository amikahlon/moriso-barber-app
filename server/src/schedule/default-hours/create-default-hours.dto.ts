import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDefaultHoursDto {
  @ApiPropertyOptional({
    example: 6,
    description: '1=ראשון, 7=שבת, null=כל יום',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek?: number;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'פורמט שגוי — HH:MM' })
  startTime!: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'פורמט שגוי — HH:MM' })
  endTime!: string;
}
