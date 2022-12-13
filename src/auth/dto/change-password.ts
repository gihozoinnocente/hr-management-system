import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[\d])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/, {
    message: 'Password is weak',
  })
  password: string;
}
