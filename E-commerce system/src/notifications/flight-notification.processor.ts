import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { OneSignalService } from 'src/notifications/onesignal.service';

interface FlightStatusUpdateJob {
  flightNumber: string;
  newStatus: string;
  playerIds: string[];
}

@Processor('notification')
export class FlightNotificationProcessor {
  constructor(private readonly oneSignalService: OneSignalService) {}

  @Process('flight-status-update')
  async handleFlightStatusUpdate(job: Job<FlightStatusUpdateJob>) {
    const { flightNumber, newStatus, playerIds } = job.data;

    if (playerIds.length === 0) {
      console.log(
        `No players found for flight ${flightNumber}. Skipping notification.`,
      );
      return;
    }

    try {
      await this.oneSignalService.sendNotification(
        { en: `Flight number ${flightNumber} has been Status Updated` },
        { en: `The flight status is now: ${newStatus}` },
        playerIds,
      );
    } catch (err) {
      console.error(`Notification failed for flight ${flightNumber}:`, err);
      throw err;
    }
  }
}
