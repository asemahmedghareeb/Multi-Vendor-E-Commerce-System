import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FcmService } from './fcm.service';
import { SendNotificationDto } from './dto/sendNotification.dto';

@Resolver()
export class FcmResolver {
    constructor(private readonly fcmService: FcmService) {}

    @Mutation(() => String)
    async sendNotification(@Args("notification") notification: SendNotificationDto) {
        return this.fcmService.sendNotification(notification);
    }
}
