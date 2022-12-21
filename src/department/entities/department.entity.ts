import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import Audit from '../../shared/interface/audit.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Department extends Audit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  department_name: string;

  @ManyToOne(() => User, (user) => user.department)
  user: User;

  @OneToMany(() => Profile, (profile) => profile.department)
  profiles: Profile[];
}
