import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderItemsLoader {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  public readonly byOrderId = new DataLoader<string, OrderItem[]>(
    async (orderIds: string[]) => {
      const items = await this.orderItemRepo.find({
        where: { order: { id: In(orderIds) } },
        order: { createdAt: 'ASC' },
      });

      const grouped = new Map<string, OrderItem[]>();

      items.forEach((item) => {
        const orderId = item.orderId;
        if (!grouped.has(orderId)) {
          grouped.set(orderId, []);
        }
        grouped.get(orderId)?.push(item);
      });

      return orderIds.map((id) => grouped.get(id) || []);
    },
  );

  public readonly byVendorId = new DataLoader<string, OrderItem[]>(
    async (vendorIds: string[]) => {
      const items = await this.orderItemRepo.find({
        where: { vendor: { id: In(vendorIds) } },
        order: { createdAt: 'DESC' },
      });

      const grouped = new Map<string, OrderItem[]>();

      items.forEach((item) => {
        const vId = item.vendorId;

        if (vId) {
          if (!grouped.has(vId)) {
            grouped.set(vId, []);
          }
          grouped.get(vId)?.push(item);
        }
      });

      return vendorIds.map((id) => grouped.get(id) || []);
    },
  );
}
