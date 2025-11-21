import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from 'src/products/entities/product.entity';


@Injectable({ scope: Scope.REQUEST })
export class ProductLoader {
  constructor(@InjectRepository(Product) private readonly productRepo: Repository<Product>) {}

  public readonly batchProducts = new DataLoader<string, Product>(async (ids) => {
    const products = await this.productRepo.findBy({ id: In(ids) });
    const map = new Map(products.map((p) => [p.id, p]));
    return ids.map((id) => map.get(id) || new Error(`Product ${id} not found`));
  });
}