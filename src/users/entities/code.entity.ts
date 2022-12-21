import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'code' })
export class Code {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ name: 'code', nullable: false })
  code: string;
  @ApiProperty()
  @Column({ nullable: false })
  expiryDate: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
