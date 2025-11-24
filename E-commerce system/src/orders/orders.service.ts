import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
import { OrderTracking } from './entities/order-tracking.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { IPaginatedType } from 'src/common/dto/paginated-output';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderTracking)
    private readonly orderTrackingRepo: Repository<OrderTracking>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(OrderTracking)
    private readonly trackingRepo: Repository<OrderTracking>,
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async findAllOrders(
    pagination: PaginationInput,
  ): Promise<IPaginatedType<Order>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.orderRepo.findAndCount({
      relations: ['payment', 'user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  @Transactional()
  async createOrder(
    user: { role: string; userId: string },
    input: CreateOrderInput,
  ): Promise<Order> {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: user.userId } },
      relations: ['items', 'user', 'items.product', 'items.product.vendor'],
      order: { items: { createdAt: 'ASC' } },
    });

    if (!cart) {
      throw new NotFoundException('events.cart.NOT_FOUND');
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('events.cart.EMPTY');
    }

    let totalAmount = 0;
    const orderItemsToCreate: OrderItem[] = [];

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

      orderItemsToCreate.push(orderItem);

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
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepo.save(order);

    orderItemsToCreate.forEach((item) => (item.order = savedOrder));
    const savedOrderItems = await this.orderItemRepo.save(orderItemsToCreate);

    const trackingRecords = savedOrderItems.map((savedItem) => {
      return this.orderTrackingRepo.create({
        orderItem: savedItem,
        remarks: 'Order created',
        status: OrderStatus.PENDING,
      });
    });

    await this.orderTrackingRepo.save(trackingRecords);

    await this.cartItemRepo.delete({ cart: { id: cart.id } });

    await this.paymentsService.createPaymentIntent(savedOrder);

    return savedOrder;
  }

  async getMyOrders(userId: string): Promise<Order[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('events.user.NOT_FOUND');

    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async getVendorOrders(userId: string): Promise<OrderItem[]> {
    const vendor = await this.vendorRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!vendor) throw new NotFoundException('events.vendor.NOT_FOUND');

    return this.orderItemRepo.find({
      where: { vendor: { id: vendor.id } },
      relations: ['product', 'order', 'order.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrder(
    orderId: string,
    userId: string,
    role: string,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'payment', 'items.vendor'],
    });

    if (!order) throw new NotFoundException('events.order.NOT_FOUND');

    if (role !== 'SUPER_ADMIN' && order.userId !== userId) {
      throw new ForbiddenException('events.common.FORBIDDEN');
    }

    return order;
  }

  async updateOrderItemStatus(
    user: { userId: string; role: string },
    itemId: string,
    newStatus: OrderStatus,
  ): Promise<OrderItem> {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId },
      relations: ['vendor', 'vendor.user'],
    });

    if (!item) throw new NotFoundException('events.order.ITEM_NOT_FOUND');

    if (item.vendor.userId !== user.userId || user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('events.vendor.NOT_OWNER');
    }

    item.status = newStatus;
    const savedItem = await this.orderItemRepo.save(item);

    await this.trackingRepo.save({
      orderItem: savedItem,
      status: newStatus,
      remarks: 'Updated by vendor',
    });

    return savedItem;
  }
}
