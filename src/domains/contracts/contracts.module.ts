import { Module } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { DatabaseService } from "src/database/database.service";
import { EventsService } from "src/domains/events/events.service";
import { NotificationsService } from "src/domains/notifications/notifications.service";

@Module({
  controllers: [ContractsController],
  providers: [
    ContractsService,
    DatabaseService,
    EventsService,
    NotificationsService
  ]
})
export class ContractsModule {}
