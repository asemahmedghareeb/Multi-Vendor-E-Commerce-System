import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from 'src/users/entities/user.entity';
import { CartModule } from 'src/cart/cart.module';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { CartItem } from 'src/cart/entities/cart-item.entity';
import { OrderTracking } from './entities/order-tracking.entity';
import { PaymentsService } from 'src/payments/payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderTracking,
      Product, 
      CartItem,
      User,
      Payment,
    ]),
    CartModule,
  ],
  providers: [OrdersResolver, OrdersService, PaymentsService],
  exports: [OrdersService],
})
export class OrdersModule {}
