import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order)
  @UseGuards(AuthGuard)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @CurrentUser() user: { role: string; userId: string },
  ) {
    return this.ordersService.createOrder(user, input);
  }

  // Optional: A simple query to see my orders
  @Query(() => [Order], { name: 'myOrders' })
  @UseGuards(AuthGuard)
  async myOrders(@CurrentUser() user: User) {
    // You'll need to add a simple find method in service for this later
    // return this.ordersService.findAllByUser(user.id);
    return [];
  }
}
