import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hod: number;
}
