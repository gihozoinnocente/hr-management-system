import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestVerificationCode {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  emailOrPhone: string;
}
