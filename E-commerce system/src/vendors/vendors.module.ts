import { Module } from '@nestjs/common';
import { VendorService } from './vendors.service';
import { UsersResolver } from './vendors.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { User } from 'src/users/entities/user.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Vendor, Review]), ProductsModule],
  providers: [UsersResolver, VendorService],
})
export class vendorsModule {}
