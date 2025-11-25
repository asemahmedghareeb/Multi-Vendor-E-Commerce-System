import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';

import { EmailsModule } from './emails/emails.module';
import { BullModule } from '@nestjs/bull';
import { DataLoadersModule } from './dataLoaders/dataLoaders.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CommonModule } from './common/common.module';
import {
  addTransactionalDataSource,
  deleteDataSourceByName,
  getDataSourceByName,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { PubSubModule } from './pubsub/pubsub.module';
import { FcmModule } from './fcm/fcm.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { vendorsModule } from './vendors/vendors.module';
import { Vendor } from './vendors/entities/vendor.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';
import { CategoriesModule } from './categories/categories.module';
import {
  AcceptLanguageResolver,
  I18nModule,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import { UsersModule } from './users/users.module';
import * as path from 'path';
import { User } from './users/entities/user.entity';
import { CartModule } from './cart/cart.module';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { OrderTracking } from './orders/entities/order-tracking.entity';
import { APP_FILTER } from '@nestjs/core';
import { I18nExceptionFilter } from './common/filters/i18n-exception.filter';
import { Payment } from './payments/entities/payment.entity';
import { WalletModule } from './wallet/wallet.module';
import { Wallet } from './wallet/entities/wallet.entity';
import { WalletTransaction } from './wallet/entities/wallet-transaction.entity';
import { FollowModule } from './follow/follow.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Follow } from './follow/entities/follow.entity';
import { Review } from './reviews/entities/review.entity';
import { Refund } from './payments/entities/refund.entity';
import { NotificationsModule } from './notifications/Notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
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
            Cart,
            CartItem,
            Order,
            OrderItem,
            OrderTracking,
            Payment,
            Wallet,
            WalletTransaction,
            Follow,
            Review,
            Refund,
            // PushDevice,
          ],
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        if (getDataSourceByName('default')) {
          deleteDataSourceByName('default');
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
        const originalError = error.originalError;

        // 1. Fast exit for non-NestJS errors (Syntax, Type Errors, etc.)
        if (!originalError) {
          return {
            message: formattedError.message,
            code: formattedError.extensions?.code,
            path: formattedError.path,
            timestamp: new Date().toISOString(),
          };
        }

        // 2. Variables to hold extracted data
        let message = originalError.message || formattedError.message;
        let statusCode = 500;
        let errorType = 'Internal Server Error';
        let allMessages = undefined;

        // 3. Handle NestJS Exceptions (Standard & I18nFilter)
        if (originalError.response) {
          const response = originalError.response;
          statusCode = originalError.status || 400;
          errorType = response.error || 'Error';

          // If response is a string (from our I18nExceptionFilter)
          if (typeof response === 'string') {
            message = response;
          }
          // If response is an object (Standard Validation)
          else if (typeof response === 'object') {
            // If it's an array of messages
            if (Array.isArray(response.message)) {
              message = response.message[0];
              allMessages = response.message;
            }
            // Fallback for object style
            else if (response.message) {
              message = response.message;
            }
          }
        }
        // 4. Handle Raw Class-Validator / I18n Pipe Errors (if filter is bypassed)
        else if (originalError.errors) {
          statusCode = 400;
          errorType = 'Bad Request';
          const rawErrors = originalError.errors;

          // Map to clean strings
          const cleanMessages = rawErrors.map((err: any) =>
            typeof err === 'string'
              ? err
              : Object.values(err.constraints || {})[0],
          );

          message = cleanMessages[0];
          allMessages = cleanMessages;
        }

        // 5. Return Unified Error Structure
        return {
          message,
          allMessages,
          statusCode,
          error: errorType,
          path: formattedError.path,
          timestamp: new Date().toISOString(),
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
    AuthModule,
    EmailsModule,
    DataLoadersModule,
    CommonModule,
    PubSubModule,
    NotificationsModule,
    FcmModule,
    ProductsModule,
    PaymentsModule,
    OrdersModule,
    vendorsModule,
    CategoriesModule,
    UsersModule,
    CartModule,
    WalletModule,
    FollowModule,
    ReviewsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
