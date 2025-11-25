import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['src/**/*.entity.ts'], 
  migrations: ['src/database/migrations/*.ts'], 
  synchronize: false, 
  logging: true,
});