
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from 'src/products/entities/product.entity';

@Injectable({ scope: Scope.REQUEST })
export class ProductLoader {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  public readonly batchProducts = new DataLoader<string, Product>(
    async (ids: string[]) => {
      const products = await this.productRepo.findBy({ id: In(ids) });
      const map = new Map(products.map((p) => [p.id, p]));
      return ids.map(
        (id) => map.get(id) || new Error(`Product ${id} not found`),
      );
    },
  );

  public readonly byVendorId = new DataLoader<string, Product[]>(
    async (vendorIds: string[]) => {
      const products = await this.productRepo.find({
        where: { vendor: { id: In(vendorIds) } },
        order: { createdAt: 'DESC' },
      });

      const grouped = new Map<string, Product[]>();

      products.forEach((p) => {
        const vId = p.vendorId;

        if (vId) {
          if (!grouped.has(vId)) {
            grouped.set(vId, []);
          }
          grouped.get(vId)?.push(p);
        }
      });

      return vendorIds.map((id) => grouped.get(id) || []);
    },
  );
}
