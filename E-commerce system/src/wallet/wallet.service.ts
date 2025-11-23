import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import {
  WalletTransaction,
  TransactionType,
} from './entities/wallet-transaction.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Transactional } from 'typeorm-transactional';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/common/enums/roles.enum';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Transactional()
  async processOrderRevenue(order: Order) {
    const superAdmin = await this.userRepo.findOne({
      where: { role: UserRole.SUPER_ADMIN },
      relations: ['wallet'],
    });

    if (!superAdmin) {
      console.warn('No Super Admin found to receive commissions!');
    }

    for (const item of order.items) {
      const vendorUser = await this.userRepo.findOne({
        where: { vendorProfile: { id: item.vendorId } },
        relations: ['wallet', 'vendorProfile'],
      });

      if (!vendorUser || !vendorUser.vendorProfile) continue;

      let vendorWallet = vendorUser.wallet;
      if (!vendorWallet) {
        vendorWallet = this.walletRepo.create({ user: vendorUser, balance: 0 });
        await this.walletRepo.save(vendorWallet);
      }

      const itemTotal = item.priceAtPurchase * item.quantity;
      const commissionRate =
        Number(vendorUser.vendorProfile.commissionRate) / 100;

      const commissionFee = Math.floor(itemTotal * commissionRate);
      const vendorIncome = itemTotal - commissionFee;

      vendorWallet.balance += vendorIncome;
      await this.walletRepo.save(vendorWallet);

      const vendorTx = this.txRepo.create({
        wallet: vendorWallet,
        order: order,
        amount: vendorIncome,
        type: TransactionType.SALE,
        description: `Revenue from ${item.quantity}x Item #${item.productId}`,
      });
      await this.txRepo.save(vendorTx);

      if (superAdmin) {
        let adminWallet = superAdmin.wallet;
        if (!adminWallet) {
          adminWallet = this.walletRepo.create({
            user: superAdmin,
            balance: 0,
          });
          await this.walletRepo.save(adminWallet);

          superAdmin.wallet = adminWallet;
        }

        adminWallet.balance += commissionFee;
        await this.walletRepo.save(adminWallet);

        const adminTx = this.txRepo.create({
          wallet: adminWallet,
          order: order,
          amount: commissionFee,
          type: TransactionType.COMMISSION,
          description: `Commission from Order #${order.id} (Vendor: ${vendorUser.vendorProfile.businessName})`,
        });
        await this.txRepo.save(adminTx);
      }
    }

    console.log(`Wallet Splits Completed.`);
  }

  async getMyWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (user) {
        wallet = this.walletRepo.create({ user, balance: 0 });
        await this.walletRepo.save(wallet);
      }
    }

    return wallet!;
  }
}
