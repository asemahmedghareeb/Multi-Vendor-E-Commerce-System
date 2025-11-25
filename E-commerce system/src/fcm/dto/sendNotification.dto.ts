

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SendNotificationDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  body: string;
}