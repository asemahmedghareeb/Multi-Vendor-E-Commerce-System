import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';
import { ProductLoader } from '../dataLoaders/products.loader';
import { Product } from '../products/entities/product.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => Cart, { name: 'myCart' })
  @UseGuards(AuthGuard)
  async myCart(@CurrentUser() user: { role: string; userId: string }) {
    return this.cartService.getCart(user.userId);
  }

  @Mutation(() => Cart)
  @UseGuards(AuthGuard)
  async addToCart(
    @Args('input') input: AddToCartInput,
    @CurrentUser() user: { role: string; userId: string },
  ) {
    return this.cartService.addToCart(user.userId, input);
  }

  @Mutation(() => Cart)
  @UseGuards(AuthGuard)
  async updateCartItem(
    @Args('input') input: UpdateCartItemInput,
    @CurrentUser() user: { role: string; userId: string },
  ) {
    return this.cartService.updateCartItem(user.userId, input);
  }

  @Mutation(() => Cart)
  @UseGuards(AuthGuard)
  async removeFromCart(
    @Args('cartItemId') cartItemId: string,
    @CurrentUser() user: { role: string; userId: string },
  ) {
    return this.cartService.removeFromCart(user.userId, cartItemId);
  }
}

@Resolver(() => CartItem)
export class CartItemResolver {
  constructor(private readonly productLoader: ProductLoader) {}

  @ResolveField(() => Product)
  async product(@Parent() cartItem: CartItem) {
    if (cartItem.product) return cartItem.product;
    if (!cartItem.productId) return null;
    return this.productLoader.batchProducts.load(cartItem.productId);
  }
}
