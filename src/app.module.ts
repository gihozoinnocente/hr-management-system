
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { runtimeConfig } from './shared/config/app.config';
import { TypeOrmFactoryConfigService } from './shared/config/typeorm-factory-config.service';
import { DatabaseExceptionFilter } from './shared/filters/database-exception.filter';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { AuditInterceptor } from './shared/interceptors/audit.interceptor';
import { ClassTransformInterceptor } from './shared/interceptors/class-transform.interceptor';
import { ResponseTransformInterceptor } from './shared/interceptors/response-transform.interceptor';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BcryptService } from './shared/util/bcrypt.service';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [runtimeConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmFactoryConfigService,
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: DatabaseExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassTransformInterceptor },
    AppService,
    BcryptService,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(

  ) {}
  async onApplicationBootstrap() {
  }
}
