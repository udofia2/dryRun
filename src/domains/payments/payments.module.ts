import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { EventsService } from "../events/events.service";
import { NotificationsService } from "../notifications/notifications.service";
import { DatabaseService } from "src/database/database.service";
import { EmailService } from "src/provider/email/email.service";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    DatabaseService,
    EventsService,
    NotificationsService,
    EmailService,
    ConfigService
  ]
})
export class PaymentsModule {}
