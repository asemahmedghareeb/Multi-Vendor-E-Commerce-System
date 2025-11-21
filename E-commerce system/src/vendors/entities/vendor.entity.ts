import { Entity, Column, OneToOne, JoinColumn, RelationId } from 'typeorm';
import { ObjectType, Field, Float } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';


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


  @Field(() => User)
  @OneToOne(() => User, (user) => user.vendorProfile)
  @JoinColumn({ name: 'userId' }) // Best practice: Explicitly name the DB column
  user: User;


  // @Field() 
  @RelationId((vendor: Vendor) => vendor.user)
  userId: string;
}