import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { DatabaseService } from "src/database/database.service";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { EmailService } from "src/provider/email/email.service";
import { SmsService } from "src/provider/sms/sms.service";
import { PushService } from "src/provider/push/push.service";
import { FirebasePushProvider } from "src/provider/push/providers/firebase.provider";
import { ExpoPushProvider } from "src/provider/push/providers/expo.provider";
import { LocalPushProvider } from "src/provider/push/providers/local.provider";
import { TwilioSmsProvider } from "src/provider/sms/providers/twilio.provider";
import { AwsSnsProvider } from "src/provider/sms/providers/aws-sns.provider";
import { LocalSmsProvider } from "src/provider/sms/providers/local.provider";
import { RolesPermissionsService } from "src/domains/roles-permissions/roles-permissions.service";
import { OrganizationService } from "src/domains/organization/organization.service";

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
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
    LocalSmsProvider,
    RolesPermissionsService,
    OrganizationService
  ],
  exports: [UsersService]
})
export class UsersModule {}
