import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SendGrindService } from './sendgrid.service';
import { SmsService } from './sms.service';

@Module({
  imports: [forwardRef(() => AuthModule), HttpModule],
  providers: [SendGrindService, SmsService],
})
export class NotificationsModule {}
