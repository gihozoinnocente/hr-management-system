import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AfricasTalkingService } from './africas-talking.service';
import { SendGrindService } from './sendgrid.service';
import { SmsService } from './sms.service';

@Module({
  imports: [forwardRef(() => AuthModule), HttpModule],
  providers: [AfricasTalkingService, SendGrindService, SmsService],
})
export class NotificationsModule {}
