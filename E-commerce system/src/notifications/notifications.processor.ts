import { EmailsService } from 'src/emails/emails.service';
import { Process, Processor } from '@nestjs/bull';
import bull from 'bull';
import { Logger } from '@nestjs/common';

@Processor('notification')
export class NotificationsProcessor {
  constructor(private emailsService: EmailsService) {}
  private readonly logger = new Logger(NotificationsProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: bull.Job) {
    const { to, subject, type, payload } = job.data;

    this.logger.log(`[${type}] Processing email for ${to}...`);

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

      this.logger.log(`Email job ${job.id} completed.`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);

      throw error;
    }
  }
}
