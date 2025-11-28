import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import rateLimit from 'express-rate-limit';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { I18nValidationPipe } from 'nestjs-i18n';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  initializeTransactionalContext();


  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, 
  });

  app.enableCors({
    origin: 'http://localhost:5175',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });


  app.use('/payments/webhook', bodyParser.raw({ type: 'application/json' }));


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));


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
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT!);
  console.log(`Server started on http://localhost:${process.env.PORT}/graphql`);
}
bootstrap();