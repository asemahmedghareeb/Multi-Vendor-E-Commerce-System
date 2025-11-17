// src/subscriptions/push-device.resolver.ts
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PushDeviceService } from './push-notifications.service';
import { PushDevice } from './entities/PushDevice.entity';
import { RegisterPushDeviceInput } from './dto/register-push-device.input';
import { NotificationResponse } from './dto/notification-response.model';
import { SendNotificationInput } from './dto/send-notification.input';
import { OneSignalService } from './onesignal.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Resolver(() => PushDevice)
export class PushDeviceResolver {
  constructor(
    private readonly pushDeviceService: PushDeviceService,
    private readonly oneSignalService: OneSignalService,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(() => PushDevice)
  async registerPushDevice(
    @Args('input') input: RegisterPushDeviceInput,
    @CurrentUser() user: { userId: string },
  ) {
    // const authenticatedUserId = '88587bee-4c3d-4aa4-8763-30769bcf3e44';

    return this.pushDeviceService.registerDevice(user.userId, input);
  }

  @Mutation(() => NotificationResponse)
  async sendNotification(
    @Args('input') input: SendNotificationInput,
  ): Promise<NotificationResponse> {
    console.log(input)
    const result = await this.oneSignalService.sendNotification(
      { en: input.title },
      { en: input.message },
      input.playerIds,
    );
    return {
      id: result.id,
      recipients: result.recipients,
    };
  }
}
