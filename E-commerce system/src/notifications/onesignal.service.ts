import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OneSignalService {
  private readonly logger = new Logger(OneSignalService.name);
  private readonly appId = process.env.ONESIGNAL_APP_ID;
  private readonly apiKey = process.env.ONESIGNAL_REST_API_KEY;
  private readonly apiUrl = 'https://onesignal.com/api/v1/notifications';

  async sendNotification(
    headings: { [key: string]: string },
    contents: { [key: string]: string },
    includePlayerIds: string[],
  ) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          app_id: this.appId,
          headings,
          contents,
          include_player_ids: includePlayerIds,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.apiKey}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(error.response?.data || error.message);
      throw error;
    }
  }
}
