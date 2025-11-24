import { Global, Module, Scope } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserLoader } from './user.loader';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { VendorLoader } from './vendor.loader';
import { CategoryLoader } from './category.loader';
import { ProductLoader } from './products.loader';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { WalletTransactionsLoader } from './wallet-transactions.loader';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletTransaction } from 'src/wallet/entities/wallet-transaction.entity';
import { OrderItemsLoader } from './orderItem.loader';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { ReviewsLoader } from './reviews.loader';
@Global()
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Vendor,
      Category,
      User,
      Product,
      Wallet,
      WalletTransaction,
      OrderItem,
      Review,
    ]),
  ],
  providers: [
    UserLoader,
    CategoryLoader,
    ProductLoader,
    VendorLoader,
    WalletTransactionsLoader,
    OrderItemsLoader,
    ReviewsLoader,
  ],
  exports: [
    UserLoader,
    CategoryLoader,
    ProductLoader,
    VendorLoader,
    WalletTransactionsLoader,
    OrderItemsLoader,
    ReviewsLoader,
  ],
})
export class DataLoadersModule {}
