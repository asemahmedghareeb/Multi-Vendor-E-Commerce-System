import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async sendOrderConfirmation(
    email: string,
    orderId: string,
    totalAmount: number,
  ) {
    await this.notificationQueue.add('send-email', {
      type: 'ORDER_CONFIRMATION',
      to: email,
      subject: `Order #${orderId} Confirmed!`,
      payload: { orderId, totalAmount: totalAmount / 100 },
    });
  }

  async sendVendorApproval(email: string, businessName: string) {
    await this.notificationQueue.add('send-email', {
      type: 'VENDOR_APPROVED',
      to: email,
      subject: 'Welcome to the Platform!',
      payload: { businessName },
    });
  }
}
