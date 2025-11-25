import { VendorLoader } from '../dataLoaders/vendor.loader';
import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { genericPaginated } from 'src/common/dto/paginated-output';

import { UpdateProductInput } from './dto/update-product.input';
import { GetProductsFilterInput } from './dto/products-filter.input';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CategoryLoader } from 'src/dataLoaders/category.loader';
import { PaginationInput } from 'src/common/dto/pagination.input';

export const paginatedProduct = genericPaginated(Product);
@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly vendorLoader: VendorLoader,
    private readonly categoryLoader: CategoryLoader,
  ) {}

  @Mutation(() => Product)
  @UseGuards(AuthGuard)
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<Product> {
    return this.productsService.create(user.id, createProductInput);
  }

  @Query(() => paginatedProduct, { name: 'feed' })
  @UseGuards(AuthGuard)
  async userFeed(
    @CurrentUser() user: { userId: string },
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    const input = pagination || { page: 1, limit: 10 };
    return this.productsService.getUserFeed(user.userId, input);
  }
 
  @Query(() => paginatedProduct)
  async products(
    @Args('filter', { nullable: true }) filter?: GetProductsFilterInput,
  ) { 
    const input = filter || { page: 1, limit: 10 };
    return this.productsService.findAll(input);
  }

  @Query(() => Product)
  async product(@Args('id', { type: () => String }) id: string) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => Product)
  @UseGuards(AuthGuard)
  async updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.productsService.update(user.id, user.role, updateProductInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async removeProduct(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.productsService.remove(user.id, user.role, id);
  }

  @ResolveField(() => Vendor)
  async vendor(@Parent() product: Product) {
    if (product.vendor) return product.vendor;
    return this.vendorLoader.batchVendors.load(product.vendorId);
  }

  @ResolveField(() => Category)
  async category(@Parent() product: Product) {
    if (product.category) return product.category;
    return this.categoryLoader.batchCategories.load(product.categoryId);
  }
}
