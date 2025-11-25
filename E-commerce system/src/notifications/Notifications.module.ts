import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notification.service';
import { NotificationsProcessor } from './notifications.processor';


@Global() 
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}