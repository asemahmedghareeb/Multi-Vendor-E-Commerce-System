import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class ResendOtpInput {
  @Field()
  @IsEmail()
  email: string;
}