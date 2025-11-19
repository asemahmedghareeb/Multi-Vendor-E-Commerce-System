import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min, IsOptional } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1, { message: 'Page must be 1 or higher' })
  @IsOptional()
  page = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1, { message: 'Limit must be 1 or higher' })
  @IsOptional()
  limit = 10;
}
