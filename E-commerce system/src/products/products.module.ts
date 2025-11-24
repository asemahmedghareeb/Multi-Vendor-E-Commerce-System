import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Category } from '../categories/entities/category.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Product, Vendor, Category])],
  providers: [ProductsResolver, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
