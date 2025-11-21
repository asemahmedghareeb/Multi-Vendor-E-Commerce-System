import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { Vendor } from 'src/vendors/entities/vendor.entity';

@Injectable({ scope: Scope.REQUEST })
export class VendorLoader {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  public readonly batchVendors = new DataLoader<string, Vendor>(
    async (vendorIds: string[]) => {
      const vendors = await this.vendorRepo.findBy({
        id: In(vendorIds),
      });

      const vendorMap = new Map(vendors.map((vendor) => [vendor.id, vendor]));

      return vendorIds.map(
        (id) => vendorMap.get(id) || new Error(`Vendor ${id} not found`),
      );
    },
  );
}
