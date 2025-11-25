import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { FcmService } from './fcm.service';
import { SendNotificationDto } from './dto/sendNotification.dto';

@Processor('fcm_queue')
export class FcmProcessor {
  constructor(private readonly fcmService: FcmService) {}

  @Process('send-push')
  async handleSendPush(job: Job<SendNotificationDto>) {
    try {
      await this.fcmService.sendNotification(job.data);
    } catch (error) {
      throw error;
    }
  }
}
