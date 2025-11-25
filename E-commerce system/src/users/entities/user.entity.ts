import { Entity, Column, OneToOne, RelationId, OneToMany } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../common/enums/roles.enum';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Device } from './device.entity';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  otpExpires: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Field(() => Vendor, { nullable: true })
  @OneToOne(() => Vendor, (vendor) => vendor.user, { nullable: true })
  vendorProfile?: Vendor;

  @RelationId((user: User) => user.vendorProfile)
  vendorId?: string;

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @Field()
  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @Field()
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @Field()
  @OneToOne(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist;
}
