import { forwardRef, Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SendGrindService } from './../notifications/sendgrid.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BcryptService } from '../shared/util/bcrypt.service';
import { JwtRefreshTokenStrategy } from './strategies/refresh-jwt.strategy';
import { SmsService } from '../notifications/sms.service';
import { Code } from 'src/users/entities/code.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Code]),
    NotificationsModule,
    forwardRef(() => UsersModule),
    PassportModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    SendGrindService,
    SmsService,
    BcryptService,
  ],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
