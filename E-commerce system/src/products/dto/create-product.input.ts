import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

import { i18nValidationMessage } from 'nestjs-i18n'; 

@InputType()
export class CreateProductInput {
  @Field()
  @IsString({ message: i18nValidationMessage('events.validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('events.validation.NOT_EMPTY') })
  name: string;

  @Field()
  @IsString({ message: i18nValidationMessage('events.validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('events.validation.NOT_EMPTY') })
  description: string;

  @Field(() => Float)
  @IsNumber({}, { message: i18nValidationMessage('events.validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('events.validation.MIN') })
  price: number;

  @Field(() => Int)
  @IsInt({ message: i18nValidationMessage('events.validation.IS_INT') })
  @Min(0, { message: i18nValidationMessage('events.validation.MIN') })
  inventoryCount: number;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('events.validation.IS_STRING') })
  categoryId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray() 
  @IsString({ each: true })
  images?: string[];
}
