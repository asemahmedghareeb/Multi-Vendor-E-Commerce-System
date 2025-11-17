import { Injectable } from '@nestjs/common';
import transporter from './email.config';

@Injectable()
export class EmailsService {
  async sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    return true;
  }
}
