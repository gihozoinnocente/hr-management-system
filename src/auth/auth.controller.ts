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
  UseGuards,
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
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SUCCESS_LOGIN } from 'src/shared/constants/auth.constants';
import { Patch } from '@nestjs/common/decorators';
import { AuthUser, GetUser } from './decorators/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

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
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<GenericResponse<void>> {
    const result = await this.authService.registerUser(createUserDto);
    return {
      message: 'User registered successfully',
      results: result,
    };
  }
  @ApiCreatedResponse({
    description: 'Verification code sent',
    ...getGenericResponseSchema(),
  })
  @ApiNotFoundResponse({ description: 'No email or phone found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(HttpStatus.CREATED)
  @Post('/requestVerCode')
  async requestVerification(
    @Body() requestVerificationCodeDto: RequestVerificationCode,
  ): Promise<GenericResponse<string>> {
    await this.authService.requestVerification(
      requestVerificationCodeDto.emailOrPhone,
    );
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
  async verification(
    @Query() verCode: AccountVerificationDto,
  ): Promise<GenericResponse<string>> {
    const results = await this.authService.verification(
      verCode.verificationCode,
    );

    return { message: 'Account verified successfully', results: '' };
  }
  @ApiCreatedResponse({
    description: 'login successfully',
    ...getGenericResponseSchema(User),
  })
  @ApiExtraModels(User)
  @ApiConflictResponse({ description: 'User logged in successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(HttpStatus.OK)
  @Post('/Adminlogin')
  async login(@Body() loginDto: LoginDto): Promise<GenericResponse<any>> {
    const result = await this.authService.adminLogin(
      loginDto.password,
      loginDto.email,
    );
    return {
      message: SUCCESS_LOGIN,
      results: { refreshToken: result.refreshToken, user: result.user },
    };
  }
  @ApiCreatedResponse({
    description: 'login successfully',
    ...getGenericResponseSchema(User),
  })
  @ApiExtraModels(User)
  @ApiConflictResponse({ description: 'User logged in successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(HttpStatus.OK)
  @Post('/userlogin')
  async userlogin(@Body() loginDto: LoginDto): Promise<GenericResponse<any>> {
    const result = await this.authService.standardUserLogin(
      loginDto.password,
      loginDto.email,
    );
    return {
      message: SUCCESS_LOGIN,
      results: { refreshToken: result.refreshToken, user: result.user },
    };
  }
  @ApiCreatedResponse({
    description: 'password changed successfully',
    ...getGenericResponseSchema(User),
  })
  @ApiExtraModels(User)
  @ApiConflictResponse({ description: 'password changed successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(HttpStatus.OK)
  @Patch('/changePassword')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<GenericResponse<any>> {
    const result = await this.authService.changePassword(
      req.User,
      changePasswordDto,
    );
    return {
      message: 'password changed successfully',
      results: { user: result.user },
    };
  }
}
