import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';

export enum DeviceType {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}
registerEnumType(DeviceType, {
  name: 'DeviceType',
  description: 'The type of device/platform used for push notifications',
});

@ObjectType()
@Entity('push_devices')
@Index(['userId', 'playerId'], { unique: true })
export class PushDevice {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  userId: string;
//=>>>
  @ManyToOne(() => User, (user) => user.pushDevices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Column({ unique: true })
  playerId: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.WEB,
  })
  deviceType: DeviceType;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
