import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from './enum/order-status.enum';
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

  @Query(() => [Order], { name: 'myOrders' })
  @UseGuards(AuthGuard)
  async myOrders(@CurrentUser() user: User) {
    return this.ordersService.getMyOrders(user.id);
  }

  @Query(() => [OrderItem], { name: 'vendorOrders' })
  @UseGuards(AuthGuard)
  async vendorOrders(@CurrentUser() user: { role: string; userId: string }) {
    return this.ordersService.getVendorOrders(user.userId);
  }

  @Mutation(() => OrderItem)
  @UseGuards(AuthGuard)
  async updateItemStatus(
    @Args('itemId') itemId: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
    @CurrentUser() user: { role: string; userId: string },
  ) {
    return this.ordersService.updateOrderItemStatus(user, itemId, status);
  }
}
