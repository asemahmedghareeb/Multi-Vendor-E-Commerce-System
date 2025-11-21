import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemResolver, CartResolver } from './cart.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsModule } from 'src/products/products.module';
import { Product } from 'src/products/entities/product.entity';
import { DataLoadersModule } from 'src/dataLoaders/dataLoaders.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product, User]),
    ProductsModule,
    DataLoadersModule,
  ],

  providers: [CartResolver, CartService, CartItemResolver],
})
export class CartModule {}
