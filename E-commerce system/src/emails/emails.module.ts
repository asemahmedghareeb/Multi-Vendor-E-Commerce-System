import { Global, Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsProcessor } from './email.processor';
@Global()
@Module({
  providers: [EmailsService, EmailsProcessor],
  controllers: [],
  exports: [EmailsService],
})
export class EmailsModule {}
