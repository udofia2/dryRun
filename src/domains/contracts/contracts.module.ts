import { Module } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { DatabaseService } from "src/database/database.service";
import { EventsService } from "src/domains/events/events.service";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { EmailService } from "src/provider/email/email.service";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [ContractsController],
  providers: [
    ContractsService,
    DatabaseService,
    EventsService,
    NotificationsService,
    EmailService,
    ConfigService
  ]
})
export class ContractsModule {}
