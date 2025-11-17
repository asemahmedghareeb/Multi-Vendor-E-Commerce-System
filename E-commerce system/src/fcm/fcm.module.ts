import { Module } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { FcmResolver } from './fcm.resolver';
import { firebaseAdminProvider } from './firebase-admin-provider';

@Module({
  providers: [FcmService, FcmResolver,firebaseAdminProvider]
})
export class FcmModule {}
