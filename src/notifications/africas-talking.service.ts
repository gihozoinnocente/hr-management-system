import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'africastalking-ts';
@Injectable()
export class AfricasTalkingService {
  private client;
  constructor(private configService: ConfigService) {
    this.client = new Client({
      apiKey: this.configService.get<string>('AFRICAS_TALKING_API_KEY'),
      username: this.configService.get<string>('AFRICAS_TALKING_USERNAME'),
    });
  }

  async send(phoneNumber: string | string[], message: string): Promise<any> {
    try {
      const options = {
        to: phoneNumber,
        message: message,
      };
      const response = await this.client.sendSms(options);
      return response;
    } catch (error) {
      Logger.error('Failed to send the sms to the user phone number');
    }
  }
}
