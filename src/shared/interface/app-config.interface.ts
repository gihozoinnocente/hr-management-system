import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import JwtConfig from './jwt-config.interface';

interface AppConfig {
  port: number;
  env: any;
  database?: TypeOrmModuleOptions;
  jwt?: JwtConfig;
  allowedOrigins?: string[];
}
export default AppConfig;
