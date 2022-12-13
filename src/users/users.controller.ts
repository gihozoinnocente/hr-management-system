import { Controller,  } from '@nestjs/common';
import { UsersService } from './users.service';



@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  //Login
 


  //GET /Protected
  // @Get('protected')
  // getHello(): string {
  //   return this.usersService.getHello();
  // }
}
