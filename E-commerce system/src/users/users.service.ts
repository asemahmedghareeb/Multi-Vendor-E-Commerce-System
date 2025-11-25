import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { IPaginatedType } from 'src/common/dto/paginated-output';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { UpdateUserInput } from './dto/updated-user.dto';
import { I18nService } from 'nestjs-i18n';
import { RegisterDeviceInput } from './dto/register-device.input';
import { Device } from './entities/device.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,

    private readonly i18n: I18nService,
  ) {}

  async findAll(pagination: PaginationInput): Promise<IPaginatedType<User>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.userRepo.findAndCount({
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

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['vendorProfile'],
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('events.auth.USER_NOT_FOUND'));
    }
    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findOne(id);

    if (input.email) {
      const existing = await this.userRepo.findOne({
        where: { email: input.email },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(this.i18n.t('events.auth.EMAIL_EXISTS'));
      }
      user.email = input.email;
    }

    if (input.password) {
      user.password = await bcrypt.hash(input.password, 10);
    }

    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(this.i18n.t('events.auth.USER_NOT_FOUND'));
    }

    await this.userRepo.remove(user);
    return true;
  }

  async registerDevice(
    userId: string,
    input: RegisterDeviceInput,
  ): Promise<boolean> {
    let device = await this.deviceRepo.findOne({
      where: { fcmToken: input.fcmToken },
      relations: ['user'],
    });

    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(this.i18n.t('events.auth.USER_NOT_FOUND'));
    }

    if (device) {
      if (device.user?.id !== user.id) {
        device.user = user;
      }

      device.lastActiveAt = new Date();
      if (input.platform) device.platform = input.platform;

      await this.deviceRepo.save(device);
    } else {
      device = this.deviceRepo.create({
        fcmToken: input.fcmToken,
        platform: input.platform,
        user: user,
        lastActiveAt: new Date(),
      });
      await this.deviceRepo.save(device);
    }

    return true;
  }

  async removeDevice(token: string): Promise<boolean> {
    await this.deviceRepo.delete({ fcmToken: token });
    return true;
  }
}
