import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity('sessions')
export class Session extends BaseEntity {
  
  @Field()
  @Column()
  deviceName: string; 

  @Column({ unique: true })
  refreshTokenHash: string;
  @Field()
  @Column()
  expiresAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;
  
  get isValid(): boolean {
    return this.expiresAt > new Date();
  }
}