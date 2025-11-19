import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Vendor } from './entities/vendor.entity';
import { VendorStatus } from './entities/vendor.entity';
import { EmailsService } from 'src/emails/emails.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    private readonly emailService: EmailsService,
  ) {}

  async updateVendorStatus(
    userId: string,
    status: VendorStatus,
  ): Promise<Vendor> {
    const vendor = await this.vendorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    vendor.status = status;
    await this.emailService.sendEmail(vendor.user.email, 'Vendor Status Updated', 'Your vendor status has been updated to ' + status);

    return this.vendorRepo.save(vendor);
  }
}
