import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendBroadcastDto {
  @ApiProperty({ example: 'סגור מחר' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'המספרה סגורה מחר בגלל חג' })
  @IsString()
  @IsNotEmpty()
  body!: string;
}
