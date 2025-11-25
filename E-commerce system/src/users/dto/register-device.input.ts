import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

@InputType()
export class RegisterDeviceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  platform?: string;
}