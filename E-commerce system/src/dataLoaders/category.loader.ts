import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { Category } from 'src/categories/entities/category.entity';

@Injectable({ scope: Scope.REQUEST })
export class CategoryLoader {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  public readonly batchCategories = new DataLoader<string, Category>(
    async (categoryIds: string[]) => {
      const categories = await this.categoryRepo.findBy({
        id: In(categoryIds),
      });

      const categoryMap = new Map(
        categories.map((category) => [category.id, category]),
      );

      return categoryIds.map(
        (id) => categoryMap.get(id) || new Error(`Category ${id} not found`),
      );
    },
  );

  public readonly batchChildren = new DataLoader<string, Category[]>(
    async (parentIds: string[]) => {
      const children = await this.categoryRepo.find({
        where: {
          parent: { id: In(parentIds) },
        },
      });

      const childrenMap = new Map<string, Category[]>();

      children.forEach((child) => {
        const pId = child.parentId || child.parent?.id;

        if (pId) {
          if (!childrenMap.has(pId)) {
            childrenMap.set(pId, []);
          }
          childrenMap.get(pId)?.push(child);
        }
      });
      return parentIds.map((id) => childrenMap.get(id) || []);
    },
  );
}
