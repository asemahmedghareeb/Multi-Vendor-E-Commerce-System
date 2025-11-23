import { OrderStatus } from './../orders/enum/order-status.enum';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { WalletsService } from 'src/wallet/wallet.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private configService: ConfigService,
    private readonly walletsService: WalletsService,
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
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentId: paymentIntent.id },
      relations: ['order'],
    });

    if (!payment) return;

    payment.status = PaymentStatus.SUCCEEDED;
    payment.amountCaptured = paymentIntent.amount_received;
    payment.metadata = paymentIntent;
    await this.paymentRepo.save(payment);

    const order = payment.order;
    if (order) {
      order.status = OrderStatus.PROCESSING;
      await this.orderRepo.save(order);
    }

    const fullOrder = await this.orderRepo.findOne({
      where: { id: order.id },
      relations: ['items'],
    });

    if (fullOrder) {
      await this.walletsService.processOrderRevenue(fullOrder);
    }
  }
}
