import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, Repository } from 'typeorm';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { Category } from '../categories/entities/category.entity';
import { IPaginatedType } from 'src/common/dto/paginated-output';
import { UpdateProductInput } from './dto/update-product.input';
import { GetProductsFilterInput } from './dto/products-filter.input';
import { I18nService } from 'nestjs-i18n';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { Follow } from 'src/follow/entities/follow.entity';
import { Role } from 'src/auth/guards/role.enum';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly i18n: I18nService,
  ) {}

  async create(userId: string, input: CreateProductInput): Promise<Product> {
    const vendor = await this.vendorRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!vendor) {
      throw new ForbiddenException(this.i18n.t('events.vendor.NOT_FOUND'));
    }

    const category = await this.categoryRepo.findOne({
      where: { id: input.categoryId!.toString() },
    });
    if (!category) {
      throw new NotFoundException(this.i18n.t('events.category.NOT_FOUND'));
    }

    const product = this.productRepo.create({
      ...input,
      price: Math.round(input.price * 100),
      vendor: vendor,
      category: category,
      vendorId: vendor.id,
      categoryId: category.id,
    });

    await this.productRepo.save(product);
    return product;
  }

  async getUserFeed(
    userId: string,
    pagination: PaginationInput,
  ): Promise<IPaginatedType<Product>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = this.productRepo.createQueryBuilder('product');


    qb.innerJoin(Follow, 'follow', 'follow.vendor.id = product.vendor.id');

    qb.where('follow.follower_id = :userId', { userId });

    qb.leftJoinAndSelect('product.vendor', 'vendor');

    qb.orderBy('product.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findAll(
    input: GetProductsFilterInput,
  ): Promise<IPaginatedType<Product>> {
    const {
      page,
      limit,
      search,
      categoryId,
      categoryName,
      minPrice,
      maxPrice,
    } = input;
    const skip = (page - 1) * limit;

    const qb = this.productRepo.createQueryBuilder('product');

    if (categoryName) {
      qb.leftJoin('product.category', 'category');
      qb.andWhere('category.name ILIKE :categoryName', {
        categoryName: `%${categoryName}%`,
      });
    }

    if (search) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('product.name ILIKE :search', { search: `%${search}%` })
            .orWhere('product.description ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: minPrice * 100 });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: maxPrice * 100 });
    }

    qb.orderBy('product.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findOne(id: string): Promise<Product | null> {
    const product: Product | null = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) {
      const message = this.i18n.t('events.product.NOT_FOUND');
      throw new NotFoundException(message);
    }
    return product;
  }

  async update(
    userId: string,
    userRole: string,
    input: UpdateProductInput,
  ): Promise<Product> {
    const product: Product | null = await this.findOne(input.id);
    if (!product)
      throw new NotFoundException(this.i18n.t('events.product.NOT_FOUND'));

    await this.checkOwnership(product, userId, userRole);

    if (input.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: input.categoryId },
      });
      if (!category)
        throw new NotFoundException(this.i18n.t('events.category.NOT_FOUND'));
      product.category = category;
    }

    if (input.price !== undefined) {
      product.price = Math.round(input.price * 100);
    }

    if (input.name) product.name = input.name;
    if (input.description) product.description = input.description;
    if (input.inventoryCount !== undefined)
      product.inventoryCount = input.inventoryCount;
    if (input.images) product.images = input.images;

    return this.productRepo.save(product);
  }

  async remove(userId: string, userRole: string, id: string): Promise<boolean> {
    const product: Product | null = await this.findOne(id);

    if (!product)
      throw new NotFoundException(this.i18n.t('events.product.NOT_FOUND'));
    await this.checkOwnership(product, userId, userRole);

    await this.productRepo.remove(product);
    return true;
  }

  private async checkOwnership(
    product: Product,
    userId: string,
    userRole: string,
  ) {
    if (userRole === Role.SUPER_ADMIN) return;

    const vendorProfile = await this.vendorRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!vendorProfile || product.vendor.id !== vendorProfile.id) {
      throw new ForbiddenException(this.i18n.t('events.product.NOT_OWNER'));
    }
  }

  async findAllByVendor(
    vendorId: string,
    pagination: PaginationInput,
  ): Promise<IPaginatedType<Product>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.productRepo.findAndCount({
      where: { vendor: { id: vendorId } },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findAllByCategory(
    categoryId: string,
    pagination: PaginationInput,
  ): Promise<IPaginatedType<Product>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.productRepo.findAndCount({
      where: { category: { id: categoryId } },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
}
