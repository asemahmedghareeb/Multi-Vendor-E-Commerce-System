import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional';
import { OrderStatus } from './enum/order-status.enum';
import { PaymentsService } from 'src/payments/payments.service';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cartService: CartService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Transactional()
  async createOrder(
    user: { role: string; userId: string },
    input: CreateOrderInput,
  ): Promise<Order> {
    const cart = await this.cartService.getCart(user.userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('events.cart.EMPTY');
    }

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cart.items) {
      if (item.product.inventoryCount < item.quantity) {
        throw new BadRequestException({
          key: 'events.product.INSUFFICIENT_INVENTORY',
          args: { count: item.product.inventoryCount },
        });
      }

      totalAmount += item.product.price * item.quantity;

      const orderItem = this.orderItemRepo.create({
        product: item.product,
        vendor: item.product.vendor,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
        status: OrderStatus.PENDING,
      });

      orderItems.push(orderItem);

      await this.productRepo.decrement(
        { id: item.product.id },
        'inventoryCount',
        item.quantity,
      );
    }

    const usr = await this.userRepo.findOne({ where: { id: user.userId } });

    const order = this.orderRepo.create({
      user: usr!,
      totalAmount,
      shippingAddress: input.shippingAddress,
    });

    const savedOrder = await this.orderRepo.save(order);

    orderItems.forEach((item) => (item.order = savedOrder));
    await this.orderItemRepo.save(orderItems);
    await this.cartItemRepo.delete({ cart: { id: cart.id } });

    //add the payment here
    const payment = await this.paymentsService.createPaymentIntent(savedOrder);
    
    return savedOrder;
  }
}
