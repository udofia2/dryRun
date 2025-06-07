import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { EventsService } from "../events/events.service";
import { NotificationsService } from "../notifications/notifications.service";
import { DatabaseService } from "src/database/database.service";
import { EmailService } from "src/provider/email/email.service";
import { ConfigService } from "@nestjs/config";
import { ExpoPushProvider } from "src/provider/push/providers/expo.provider";
import { FirebasePushProvider } from "src/provider/push/providers/firebase.provider";
import { LocalPushProvider } from "src/provider/push/providers/local.provider";
import { PushService } from "src/provider/push/push.service";
import { AwsSnsProvider } from "src/provider/sms/providers/aws-sns.provider";
import { LocalSmsProvider } from "src/provider/sms/providers/local.provider";
import { TwilioSmsProvider } from "src/provider/sms/providers/twilio.provider";
import { SmsService } from "src/provider/sms/sms.service";

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    DatabaseService,
    EventsService,
    NotificationsService,
    EmailService,
    ConfigService,
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
export class PaymentsModule {}
