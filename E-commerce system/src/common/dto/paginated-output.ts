import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IPaginatedType<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
}

export function genericPaginated<T>(
  classRef: Type<T>,
): Type<IPaginatedType<T>> {
  @ObjectType(`Paginated${classRef.name}Output`)
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => [classRef])
    items: T[];

    @Field(() => Int)
    totalItems: number;

    @Field(() => Int)
    totalPages: number;
  }

  return PaginatedType as Type<IPaginatedType<T>>;
}
