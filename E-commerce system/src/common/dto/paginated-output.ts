import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IPaginatedType<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
}

export function genericPaginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`Paginated${classRef.name}Output`)
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => [classRef], { description: 'The list of items on this page.' })
    items: T[];

    @Field(() => Int, {
      description: 'The total number of items in the collection.',
    })
    totalItems: number;

    @Field(() => Int, { description: 'The total number of pages.' })
    totalPages: number;
  }

  return PaginatedType as Type<IPaginatedType<T>>;
}
