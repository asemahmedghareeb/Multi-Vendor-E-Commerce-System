import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';
import { Vendor } from '../../users/entities/vendor.entity';
import { Category } from '../../categories/entities/category.entity';

@ObjectType()
@Entity('products')
export class Product extends BaseEntity {
  @Field()
  @Column()
  @Index()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Float)
  @Column({
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  price: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  inventoryCount: number;


  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, default: [] })
  images: string[];


  @Field(()=>Vendor)
  @ManyToOne(()=>Vendor)
  @JoinColumn({name:'vendor_id'})
  vendor:Vendor

  vendorId: string;

 @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;
  

  categoryId: string; 


}
