import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentService {
  userRepository: any;
  constructor(
    //@InjectRepository(User)
    //private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}
  async create(createDepartmentDto: CreateDepartmentDto) {
    //return 'This action adds a new department';
    //const user = await this.userRepository.findOne(id);
    //console.log(user);
    const userDepartment =
      this.departmentRepository.create(createDepartmentDto);
    const result = await this.departmentRepository.save(userDepartment);
    return {
      result,
    };
  }

  findAll() {
    return `This action returns all department`;
  }

  findOne(id: number) {
    return `This action returns a #${id} department`;
  }

  update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    return `This action updates a #${id} department`;
  }

  remove(id: number) {
    return `This action removes a #${id} department`;
  }
}
