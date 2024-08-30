import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { DatabaseService } from "src/database/database.service";

@Module({
  controllers: [EventsController],
  providers: [EventsService, DatabaseService]
})
export class EventsModule {}
