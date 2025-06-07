import { Module } from "@nestjs/common";
import { ProspectsService } from "./prospects.service";
import { ProspectsController } from "./prospects.controller";
import { DatabaseService } from "src/database/database.service";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { EmailService } from "src/provider/email/email.service";
import { ExpoPushProvider } from "src/provider/push/providers/expo.provider";
import { FirebasePushProvider } from "src/provider/push/providers/firebase.provider";
import { LocalPushProvider } from "src/provider/push/providers/local.provider";
import { PushService } from "src/provider/push/push.service";
import { AwsSnsProvider } from "src/provider/sms/providers/aws-sns.provider";
import { LocalSmsProvider } from "src/provider/sms/providers/local.provider";
import { TwilioSmsProvider } from "src/provider/sms/providers/twilio.provider";
import { SmsService } from "src/provider/sms/sms.service";

@Module({
  controllers: [ProspectsController],
  providers: [
    ProspectsService,
    DatabaseService,
    NotificationsService,
    EmailService,
    PushService,
    SmsService,
    FirebasePushProvider,
    ExpoPushProvider,
    LocalPushProvider,
    TwilioSmsProvider,
    AwsSnsProvider,
    LocalSmsProvider
  ]
})
export class ProspectsModule {}
