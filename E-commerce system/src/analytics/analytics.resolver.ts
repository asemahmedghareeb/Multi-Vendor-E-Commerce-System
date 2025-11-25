import { Resolver, Query, Args } from '@nestjs/graphql';
import { AnalyticsService } from './analytics.service';
import { Product } from '../products/entities/product.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { GetAnalyticsInput } from './dto/get-analytics.input';

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => [Product], { name: 'topSellingProducts' })
  async getTopProducts(
    @Args('input', { nullable: true }) input?: GetAnalyticsInput,
  ) {
    return this.analyticsService.getTopSellingProducts(input || new GetAnalyticsInput());
  }

  @Query(() => [Vendor], { name: 'topPopularVendors' })
  async getTopVendors(
    @Args('input', { nullable: true }) input?: GetAnalyticsInput,
  ) {
    return this.analyticsService.getTopVendors(input || new GetAnalyticsInput());
  }
}