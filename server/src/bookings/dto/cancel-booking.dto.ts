import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiPropertyOptional({ example: 'לא יכול להגיע' })
  @IsOptional()
  @IsString()
  reason?: string;
}
