import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class SmsService {
  constructor(
    private configService: ConfigService,
    private readonly http: HttpService,
  ) {}

  async send(phoneNumber: string | string[], message: string): Promise<void> {
    if (this.configService.get<string>('NODE_ENV') !== 'test') {
      try {
        const data = {
          to: phoneNumber,
          text: message,
          sender: `${this.configService.get<string>('PINDO_SENDER')}`,
        };
        await lastValueFrom(
          this.http
            .post(`${this.configService.get<string>('PINDO_URL')}`, data, {
              headers: {
                Authorization: `Bearer ${this.configService.get(
                  'PINDO_API_KEY',
                )}`,
              },
            })
            .pipe(
              map((response) => {
                return response.data;
              }),
            ),
        );
      } catch (error) {
        Logger.error(error.message);
        Logger.error('Failed to send the sms to the user phone number');
      }
    }
  }
}
