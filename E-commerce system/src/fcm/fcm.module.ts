import { Global, Module } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { FcmResolver } from './fcm.resolver';
import { firebaseAdminProvider } from './firebase-admin-provider';
import { BullModule } from '@nestjs/bull';
import { FcmProcessor } from './fcm.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'fcm_queue',
    }),
  ],
  providers: [FcmService, FcmResolver, firebaseAdminProvider, FcmProcessor],
  exports: [FcmService],
})
export class FcmModule {}
