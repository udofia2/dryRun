// src/domains/roles-permissions/roles-permissions.module.ts
import { Module } from "@nestjs/common";
import { RolesPermissionsController } from "./roles-permissions.controller";
import { RolesPermissionsService } from "./roles-permissions.service";
import { DatabaseService } from "src/database/database.service";
import { EmailService } from "src/provider/email/email.service";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { ConfigService } from "@nestjs/config";
import { ExpoPushProvider } from "src/provider/push/providers/expo.provider";
import { FirebasePushProvider } from "src/provider/push/providers/firebase.provider";
import { LocalPushProvider } from "src/provider/push/providers/local.provider";
import { PushService } from "src/provider/push/push.service";
import { AwsSnsProvider } from "src/provider/sms/providers/aws-sns.provider";
import { LocalSmsProvider } from "src/provider/sms/providers/local.provider";
import { TwilioSmsProvider } from "src/provider/sms/providers/twilio.provider";
import { SmsService } from "src/provider/sms/sms.service";
import { RolesPermissionsGuard } from "./guards/roles-permissions.guard";

@Module({
  controllers: [RolesPermissionsController],
  providers: [
    RolesPermissionsService,
    DatabaseService,
    EmailService,
    NotificationsService,
    ConfigService,
    PushService,
    SmsService,
    FirebasePushProvider,
    ExpoPushProvider,
    LocalPushProvider,
    TwilioSmsProvider,
    AwsSnsProvider,
    LocalSmsProvider,
    RolesPermissionsGuard
  ],
  exports: [RolesPermissionsService, RolesPermissionsGuard]
})
export class RolesPermissionsModule {}

// Usage examples:
/*
@RequireSystemPermission(PERMISSION_TYPE.permission_grant)
@Get('system-admin-endpoint')
async systemAdminOnly() {
  // Only users with system permission_grant can access
}

@RequireOrganizationPermission(PERMISSION_TYPE.collaborator_manage)
@Get('organization/:orgId/manage-collaborators')
async manageCollaborators(@Param('orgId') orgId: string) {
  // Only users with collaborator_manage permission in the specified org can access
}

@RequireAnyPermission([PERMISSION_TYPE.event_create, PERMISSION_TYPE.event_edit])
@Post('events')
async createOrEditEvent() {
  // Users with either event_create OR event_edit permission can access
}
*/
