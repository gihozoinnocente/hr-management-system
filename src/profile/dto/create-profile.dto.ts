import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender } from '../../shared/enums/gender.enum';

export class CreateProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resident_country: string;

  @ApiProperty()
  @IsString()
  birth_country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  national_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  starting_date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  profession: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  salary: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  father_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mother_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  birth_date: string;

  @ApiProperty()
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  province: string;
}
