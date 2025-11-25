import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  
  // IMPORTANT: Points to your entities so TypeORM can compare them to the DB
  entities: ['src/**/*.entity.ts'], 
  
  // Where to save the migration files
  migrations: ['src/database/migrations/*.ts'], 
  
  synchronize: false, // Always false for migrations
  logging: true,
});