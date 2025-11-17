import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import rateLimit from 'express-rate-limit';
import { initializeTransactionalContext } from 'typeorm-transactional';
async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173', 
    credentials: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        message: 'Too many requests, please try again later.',
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT!);
  console.log(`Server started on http://localhost:${process.env.PORT}/graphql`);
}
bootstrap();

//to run the containers in production mode=>   docker-compose -f docker-compose.yml  -f  docker-compose.prod.yml up -d
//to run the containers in development mode=>  docker-compose -f docker-compose.yml  -f  docker-compose.dev.yml up -d

//to build the container (use it for example when you install new package)=> docker-compose  -f  docker-compose.yml  -f docker-compose.dev.yml  up -d --build

//to stop the containers in development mode=> docker-compose  -f  docker-compose.dev.yml down
//to stop the containers in production mode=> docker-compose  -f  docker-compose.prod.yml down
//for deleting the  container => docker rm  Airport-management-system-container -f

//opening container bash => docker exec -it   Airport-management-system-container bash
//for docker logs => docker logs  Airport-management-system-container -f
