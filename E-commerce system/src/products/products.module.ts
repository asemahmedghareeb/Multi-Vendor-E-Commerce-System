import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Category } from '../categories/entities/category.entity';
import { VendorLoader } from 'src/dataLoaders/vendor.loader';
import { CategoryLoader } from 'src/dataLoaders/category.loader';


@Module({
  imports: [TypeOrmModule.forFeature([Product, Vendor, Category])],
  providers: [
    ProductsResolver,
    ProductsService,
   
  ],
})
export class ProductsModule {}
