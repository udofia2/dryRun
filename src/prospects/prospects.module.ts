import { Module } from "@nestjs/common";
import { ProspectsService } from "./prospects.service";
import { ProspectsController } from "./prospects.controller";
import { DatabaseService } from "src/database/database.service";
import { NotificationsService } from "src/notifications/notifications.service";

@Module({
  controllers: [ProspectsController],
  providers: [ProspectsService, DatabaseService, NotificationsService]
})
export class ProspectsModule {}
