import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseFilters,
  Get,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '../shared/filters/http-exception.filter';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { GenericResponse } from '../shared/interface/generic-response.interface';
import { User } from '../users/entities/user.entity';
import { getGenericResponseSchema } from '../shared/util/swagger.util';
import { AccountVerificationDto } from './dto/account-verification.dto';
import { RequestVerificationCode } from './dto/request-verification-code.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@ApiTags('Authentication')
@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'Registered successfully',
    ...getGenericResponseSchema(User),
  })
  @ApiExtraModels(User)
  @ApiConflictResponse({ description: 'User registered successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  async registerCandidate(
    @Body() createUserDto: CreateUserDto,
  ): Promise<GenericResponse<void>> {
    const result =await this.authService.registrUser(createUserDto)
    return {
      message: "User registered successfully",
      results: result,
    };
  }
/*  @ApiCreatedResponse({
    description: 'Verification code sent',
    ...getGenericResponseSchema(),
  })
  @ApiNotFoundResponse({ description: 'No email or phone found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(HttpStatus.CREATED)
  @Post('/request-verification-code')
  async requestVerification(
    @Body() requestVerificationCodeDto: RequestVerificationCode,
  ): Promise<GenericResponse<string>> {
    await this.authService.requestVerification(requestVerificationCodeDto.emailOrPhone);
    return { message: 'Verification code sent', results: '' };
  }
  @ApiCreatedResponse({
    description: 'Account verified',
    ...getGenericResponseSchema(),
  })
  @ApiUnauthorizedResponse({ description: 'Invalid verification code' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiQuery({ name: 'code' })
  @HttpCode(HttpStatus.OK)
  @Get('/verify')
  async verification(@Query() verCode:AccountVerificationDto
    ): Promise<GenericResponse<string>>{
    const results = await this.authService.verification(verCode.verificationCode);
    
    return {message:'Account verified successfully',results:''};
  }
  @HttpCode(HttpStatus.OK)
  @Post('/test')
  test():string{
    return "test";
  }*/


  //LOGIN
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() user: User): Observable<{ token: string }> {
    return this.authService
      .login(user)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }

}
