import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enum/order-status.enum';
@ObjectType()
@Entity('order_tracking')
export class OrderTracking extends BaseEntity {
  @Field(() => OrderStatus)
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => OrderItem, (item) => item.trackingHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'order_item_id', type: 'uuid' })
  orderItemId: string;
}
