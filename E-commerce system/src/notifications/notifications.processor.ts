import { EmailsService } from 'src/emails/emails.service';
import { Process, Processor } from '@nestjs/bull';
import bull from 'bull';


@Processor('notification')
export class NotificationsProcessor {
  constructor(private emailsService: EmailsService) {}

  @Process('send-email')
  async handleSendEmail(job: bull.Job) {
    const { to, subject, type, payload } = job.data;

    try {
      if (type === 'ORDER_CONFIRMATION') {
        this.emailsService.sendEmail(
          to,
          subject,
          `Thank you for your order #${payload.orderId}. Total: $${payload.totalAmount}`,
        );
      } else if (type === 'VENDOR_APPROVED') {
        this.emailsService.sendEmail(
          to,
          subject,
          `Congratulations ${payload.businessName}, your vendor account is active!`,
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
