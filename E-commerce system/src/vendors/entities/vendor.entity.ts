import { Review } from './../../reviews/entities/review.entity';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  RelationId,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';

export enum VendorStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@ObjectType()
@Entity('vendors')
export class Vendor extends BaseEntity {
  @Field()
  @Column()
  businessName: string;

  @Field()
  @Column({ type: 'text' })
  bio: string;

  @Field()
  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.PENDING })
  status: VendorStatus;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  commissionRate: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  reviewsCount: number;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.vendorProfile)
  @JoinColumn({ name: 'userId' })
  user: User;


  @RelationId((vendor: Vendor) => vendor.user)
  userId: string;

  // @Field(() => [Product])
  @OneToMany(() => Product, (product) => product.vendor)
  products: Product[];

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (orderItem) => orderItem.vendor)
  orders: OrderItem[];

  @Field(() => [Review])
  @OneToMany(() => Review, (review) => review.vendor)
  reviews: Review[];
}
