import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/sendNotification.dto';
import * as firebase from 'firebase-admin';
@Injectable()
export class FcmService {
  async sendNotification(notification: SendNotificationDto) {
    try {
      await firebase
        .messaging()
        .send({
          notification: {
            title: notification.title,
            body: notification.body,
          },
          token: notification.deviceId,
          data: {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default',
            },
          },
          apns: {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                contentAvailable: true,
                sound: 'default',
              },
            },
          },
        }) 
        .catch((error: any) => {
          console.error(error);
          return error;
        });

      return "Notification sent successfully";
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}