import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushDevice } from './entities/PushDevice.entity';
import { RegisterPushDeviceInput } from './dto/register-push-device.input';

@Injectable()
export class PushDeviceService {
  constructor(
    @InjectRepository(PushDevice)
    private readonly pushDeviceRepo: Repository<PushDevice>,
  ) {}

  async registerDevice(
    userId: string,
    input: RegisterPushDeviceInput,
  ): Promise<PushDevice> {
    let device = await this.pushDeviceRepo.findOne({
      where: { playerId: input.playerId },
    });

    if (device) {
      if (device.userId !== userId) {
        device.userId = userId;
        return this.pushDeviceRepo.save(device);
      }
      return device;
    }

    const newDevice = this.pushDeviceRepo.create({
      userId,
      playerId: input.playerId,
      deviceType: input.deviceType,
    });

    return this.pushDeviceRepo.save(newDevice);
  }
}
