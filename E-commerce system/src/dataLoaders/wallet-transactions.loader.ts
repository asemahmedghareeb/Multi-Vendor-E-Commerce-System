import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';

@Injectable({ scope: Scope.REQUEST })
export class WalletTransactionsLoader {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
  ) {}

  public readonly byWalletId = new DataLoader<string, WalletTransaction[]>(
    async (walletIds: string[]) => {
      const transactions = await this.txRepo.find({
        where: { wallet: { id: In(walletIds) } },
        order: { createdAt: 'DESC' },
      });

      const grouped = new Map<string, WalletTransaction[]>();

      transactions.forEach((tx) => {
        const wId = tx.walletId;
        if (!grouped.has(wId)) {
          grouped.set(wId, []);
        }
        grouped.get(wId)?.push(tx);
      });

      return walletIds.map((id) => grouped.get(id) || []);
    },
  );
}
