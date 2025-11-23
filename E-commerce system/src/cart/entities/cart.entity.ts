import { ObjectType, Field, Float } from '@nestjs/graphql';
import {
  Entity,
  OneToOne,
  JoinColumn,
  OneToMany,
  RelationId,
  Column,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@ObjectType()
@Entity('carts')
export class Cart extends BaseEntity {
  @Field(() => User)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((cart: Cart) => cart.user)
  userId: string;

  @Field(() => [CartItem])
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;
}
