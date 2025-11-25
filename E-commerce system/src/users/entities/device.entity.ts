import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';

@ObjectType()
@Entity('devices')
export class Device extends BaseEntity {
  @Field()
  @Column({ unique: true })
  @Index()
  fcmToken: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  platform: string;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((device: Device) => device.user)
  userId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActiveAt: Date;
}
