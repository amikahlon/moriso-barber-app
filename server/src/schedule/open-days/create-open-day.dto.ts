import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpenDayDto {
  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  date!: string;
}
