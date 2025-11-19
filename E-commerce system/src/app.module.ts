import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { PushNotificationsModule } from './notifications/push-notifications.module';
// import { PushDevice } from './notifications/entities/PushDevice.entity';
import { EmailsModule } from './emails/emails.module';
import { BullModule } from '@nestjs/bull';
import { DataLoadersModule } from './dataLoaders/dataLoaders.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CommonModule } from './common/common.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { PubSubModule } from './pubsub/pubsub.module';
import { FcmModule } from './fcm/fcm.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { Vendor } from './users/entities/vendor.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';
import { CategoriesModule } from './categories/categories.module';
import {
  AcceptLanguageResolver,
  I18nModule,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'notification',
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
    TypeOrmModule.forRootAsync({
      useFactory() {
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.POSTGRES_PORT!, 10),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          synchronize: true,
          autoLoadEntities: true,
          //  logging: true
          entities: [
            User,
            Vendor,
            Product,
            Category,
            // PushDevice,
          ],
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res }) => ({ req, res }),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      subscriptions: {
        'graphql-ws': true,
      },
 
      formatError: (formattedError, error: any) => {
        const graphQLError = error;
        const originalError = graphQLError.originalError;

        if (originalError && (originalError as any).errors) {
          const validationErrors = (originalError as any).errors;

          const messages = validationErrors.map((err: any) =>
            typeof err === 'string'
              ? err
              : Object.values(err.constraints || {})[0],
          );

          return {
            message: messages[0] || 'Validation Error',
            allMessages: messages,
            statusCode: 400,
            error: 'Bad Request',
            path: formattedError.path,
          };
        }

        // if (originalError && (originalError as any).response) {
        //   const response = (originalError as any).response;
        //   const statusCode = response.statusCode || 400;

        //   const msg = Array.isArray(response.message)
        //     ? response.message[0]
        //     : response.message;

        //   return {
        //     message: msg,
        //     allMessages: response.message,
        //     statusCode: statusCode,
        //     error: response.error || 'Bad Request',
        //     path: formattedError.path,
        //   };
        // }

        return {
          message: formattedError.message,
          code: formattedError.extensions?.code,
          path: formattedError.path,
        };
      },
    }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, // change in production
      }),
      inject: [ConfigService],
    }),
    //core modules
    AuthModule,
    //shared modules
    EmailsModule,
    DataLoadersModule,
    CommonModule,
    PubSubModule,
    PushNotificationsModule,
    FcmModule,
    ProductsModule,
    PaymentsModule,
    OrdersModule,
    UsersModule,
    CategoriesModule,
  ],
})
export class AppModule {}
