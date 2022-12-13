import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import { isRunningInProduction } from '../util/env.util';

const typeormConfig: TypeOrmModuleOptions = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  type: 'postgres',
  synchronize: false,
  keepConnectionAlive: true,
  // dropSchema: !isRunningInProduction(),
  logging: !isRunningInProduction(),
  entities: ['dist/**/*.entity.js'],
  autoLoadEntities: true,
  migrationsTableName: 'migrations',
  migrations: ['dist/migrations/*{.ts,.js}'],
  cli: { migrationsDir: 'src/migrations' },
};

export default typeormConfig;
