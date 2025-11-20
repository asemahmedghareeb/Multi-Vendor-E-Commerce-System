import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Cart } from './cart.entity';

@ObjectType()
@Entity('cart_items')
export class CartItem extends BaseEntity {
  
  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' }) 
  cart: Cart;

  @RelationId((item: CartItem) => item.cart)
  cartId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' }) 
  product: Product;


  @Field() 
  @RelationId((item: CartItem) => item.product)
  productId: string;
}