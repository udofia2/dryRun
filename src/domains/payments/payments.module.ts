import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { EventsService } from "../events/events.service";
import { NotificationsService } from "../notifications/notifications.service";
import { DatabaseService } from "src/database/database.service";

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    DatabaseService,
    EventsService,
    NotificationsService
  ]
})
export class PaymentsModule {}
