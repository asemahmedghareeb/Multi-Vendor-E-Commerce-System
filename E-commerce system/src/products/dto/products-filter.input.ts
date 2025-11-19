import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { PaginationInput } from '../../common/dto/pagination.input';

@InputType()
export class GetProductsFilterInput extends PaginationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryName?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  maxPrice?: number;
}