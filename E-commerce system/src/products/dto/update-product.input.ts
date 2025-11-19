import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { CreateProductInput } from './create-product.input';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
