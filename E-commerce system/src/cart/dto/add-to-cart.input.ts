import { InputType, Field, Int } from '@nestjs/graphql';
import { IsUUID, IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class AddToCartInput {
  @Field()
  @IsUUID('4', { message: i18nValidationMessage('validation.IS_UUID') })
  productId: string;

  @Field(() => Int)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN', { constraint1: 1 }) })
  quantity: number;
}