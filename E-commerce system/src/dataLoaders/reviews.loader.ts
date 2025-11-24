import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { Review } from 'src/reviews/entities/review.entity';


@Injectable({ scope: Scope.REQUEST })
export class ReviewsLoader {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  public readonly load = new DataLoader<string, Review[]>(
    async (vendorIds: string[]) => {
      const reviews = await this.reviewRepo.find({
        where: { vendor: { id: In(vendorIds) } },
        order: { createdAt: 'DESC' }, 
      });
      const grouped = new Map<string, Review[]>();
      
      reviews.forEach((review) => {
       
        const vId = review.vendorId; 
        if (!grouped.has(vId)) {
          grouped.set(vId, []);
        }
        grouped.get(vId)?.push(review);
      });

      return vendorIds.map((id) => grouped.get(id) || []);
    },
  );
}