import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { VerifyBy } from 'src/shared/enums/verify.enum';
import { Gender } from './../../shared/enums/gender.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[\d])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/, {
    message: 'Password is weak',
  })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[\d])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/, {
    message: 'Password is weak',
  })
  confirmPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  last_name: string;

  

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(13)
  phone_number: string;
  
  @ApiProperty()
  @IsEnum(VerifyBy)
  @IsNotEmpty()
  verifyBy: VerifyBy;

  
}
