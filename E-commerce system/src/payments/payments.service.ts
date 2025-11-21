import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in .env file');
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  async createPaymentIntent(order: Order): Promise<Payment> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: order.totalAmount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order.id,
          userId: order.userId,
        },
      });

      const payment = this.paymentRepo.create({
        order,
        stripePaymentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret as string,
        amount: order.totalAmount,
        currency: 'usd',
        status: PaymentStatus.PENDING,
        provider: 'STRIPE',
        metadata: paymentIntent,
      });

      return this.paymentRepo.save(payment);
    } catch (error) {
      console.error('Stripe Error:', error);
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // 1. Find the Payment record
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentId: paymentIntent.id },
      relations: ['order'],
    });

    if (!payment) return;

    // 2. Update Status
    payment.status = PaymentStatus.SUCCEEDED;
    payment.amountCaptured = paymentIntent.amount_received;
    payment.metadata = paymentIntent;
    await this.paymentRepo.save(payment);

    // 3. Update Order Status
    // You might need to inject OrdersService or Repository here
    // Or emit an event using EventEmitter

    // TODO: Call WalletService to distribute funds (90% Vendor, 10% Admin)
  }
}
