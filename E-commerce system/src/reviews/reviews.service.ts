import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { Order } from '../orders/entities/order.entity';
import { UpdateReviewInput } from './dto/update-review.input';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async create(userId: string, input: CreateReviewInput): Promise<Review> {
    const existing = await this.reviewRepo.findOne({
      where: {
        user: { id: userId },
        vendor: { id: input.vendorId },
        order: { id: input.orderId },
      },
    });

    if (existing) throw new BadRequestException('review.ALREADY_REVIEWED');

    const order = await this.orderRepo.findOne({
      where: { id: input.orderId },
      relations: ['items', 'user'],
    });

    if (!order) throw new NotFoundException('events.order.NOT_FOUND');
    if (order.user.id !== userId)
      throw new ForbiddenException('events.common.FORBIDDEN');

    const hasBoughtFromVendor = order.items.some(
      (item) => item.vendorId === input.vendorId,
    );

    if (!hasBoughtFromVendor) {
      throw new BadRequestException('review.MUST_BUY_FIRST');
    }

    const review = this.reviewRepo.create({
      user: { id: userId },
      vendor: { id: input.vendorId },
      order: { id: input.orderId },
      rating: input.rating,
      comment: input.comment,
    });

    return this.reviewRepo.save(review);
  }

  async findByVendor(vendorId: string) {
    return this.reviewRepo.find({
      where: { vendor: { id: vendorId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async update(userId: string, input: UpdateReviewInput): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id: input.id },
    });

    if (!review) throw new NotFoundException('events.common.NOT_FOUND');

    if (review.userId !== userId) {
      throw new ForbiddenException('events.vendor.NOT_OWNER');
    }

    if (input.rating) review.rating = input.rating;
    if (input.comment) review.comment = input.comment;

    return this.reviewRepo.save(review);
  }

  async remove(userId: string, reviewId: string): Promise<boolean> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });

    if (!review) throw new NotFoundException('events.common.NOT_FOUND');

    if (review.userId !== userId) {
      throw new ForbiddenException('events.vendor.NOT_OWNER');
    }

    await this.reviewRepo.remove(review);
    return true;
  }
}
