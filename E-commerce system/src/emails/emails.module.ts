import { Global, Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { FlightEmailProcessor } from './flight-email.processor';

@Global()
@Module({
  providers: [EmailsService, FlightEmailProcessor],
  controllers: [],
  exports: [EmailsService],
})
export class EmailsModule {}
