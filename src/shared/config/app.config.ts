import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import AppConfig from '../interface/app-config.interface';
import typeormConfig from './typeorm.config';

export const commonConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT),
  env: process.env.NODE_ENV,
});

export const runtimeConfig = (): AppConfig => ({
  allowedOrigins: process.env.ALLOWED_ORIGINS.split(','),
  database:
    process.env.NODE_ENV == 'test' ? getTestingTypeOrmConfig : typeormConfig,
  ...commonConfig(),
});

export const testingConfig = (): AppConfig => ({
  ...commonConfig(),
});

/**
 * Configures and binds Swagger with the project's application
 * @param app The NestJS Application instance
 */
export function configureSwagger(app: INestApplication): void {
  const API_TITLE = 'Capstone API';
  const API_DESCRIPTION = 'API Doc. for Capstone API';
  const API_VERSION = '1.0';
  const SWAGGER_URL = 'docs/swagger-ui';
  const options = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setDescription(API_DESCRIPTION)
    .setVersion(API_VERSION)
    // .addBearerAuth()
    .addCookieAuth('authCookie', {
      type: 'http',
      in: 'Header',
      scheme: 'Bearer',
    })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(SWAGGER_URL, app, document, {
    customSiteTitle: 'HARAMBEE API',
    swaggerOptions: { docExpansion: 'none', persistAuthorization: true },
  });
}

/**
 * Generates obj for the app's CORS configurations
 * @returns CORS configurations
 */
export function corsConfig(): CorsOptions {
  return {
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Set-Cookie, Cookies',
    credentials: true,
    origin: (origin, callback) => {
      const appConfigs = runtimeConfig();
      const whitelist = appConfigs.allowedOrigins || [];
      const canAllowUndefinedOrigin =
        origin === undefined && appConfigs.env !== 'production';

      if (whitelist.indexOf(origin) !== -1 || canAllowUndefinedOrigin) {
        callback(null, true);
      } else {
        callback(
          new UnauthorizedException(
            `Not allowed by CORS for origin:${origin} on ${appConfigs.env}`,
          ),
        );
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  };
}

const getTestingTypeOrmConfig: TypeOrmModuleOptions = {
  host: process.env.TEST_DB_HOST,
  port: parseInt(process.env.TEST_DB_PORT),
  username: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD,
  database: process.env.TEST_DB_NAME,
  type: 'postgres',
  entities: [
    __dirname + '/../**/*.entity.js',
    __dirname + '/../**/*.entity.ts',
  ],
  synchronize: true,
  logging: false,
  autoLoadEntities: true,
  keepConnectionAlive: true,
};
