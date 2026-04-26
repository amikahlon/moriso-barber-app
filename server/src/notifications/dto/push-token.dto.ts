import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'ios', enum: ['ios', 'android'] })
  @IsIn(['ios', 'android'])
  platform!: 'ios' | 'android';
}
