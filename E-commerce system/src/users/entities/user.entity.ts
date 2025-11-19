import { Entity, Column, OneToOne } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../common/enums/roles.enum';
import { Vendor } from './vendor.entity'; // We will create this next


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

  @Column({nullable:true})
  otp: string;

  @Column({nullable:true})
  otpExpires: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Field(() => Vendor, { nullable: true })
  @OneToOne(() => Vendor, (vendor) => vendor.user, { nullable: true })
  vendorProfile?: Vendor;
}
