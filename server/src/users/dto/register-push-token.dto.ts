import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxx]' })
  @IsString()
  @IsNotEmpty()
  deviceToken!: string;

  @ApiProperty({ example: 'ios', enum: ['ios', 'android'] })
  @IsIn(['ios', 'android'])
  platform!: 'ios' | 'android';
}
