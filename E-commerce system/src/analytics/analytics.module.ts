import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResolver } from './analytics.resolver';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Review } from '../reviews/entities/review.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Review, Vendor, Product])],
  providers: [AnalyticsService, AnalyticsResolver],
})
export class AnalyticsModule {}
