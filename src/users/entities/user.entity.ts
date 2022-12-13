import { Gender } from './../../shared/enums/gender.enum';
import { UserRole } from './../../shared/enums/user-roles.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Audit from '../../shared/interface/audit.entity';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


@Entity()
export class User extends Audit {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @ApiProperty()
  @Column({ name: "first_name" })
  first_name: string;

  @ApiProperty()
  @Column()
  last_name: string;

  @ApiProperty()
  @Column({ unique: true, nullable: false })
  phone_number: string;

  @ApiProperty()
  @Column({ default: UserRole.STANDARD, nullable: false })
  role: UserRole;

  @OneToMany(() => User, (user) => user.manager_id)
  manager_id: number;
  @ApiProperty()
  @Column({ default: false, nullable: true })
  active: boolean;

  @Column({ nullable: true })
  @Exclude()
  public currentHashedRefreshToken?: string;

  
}
