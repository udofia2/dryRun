import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { DatabaseService } from "src/database/database.service";
import { EmailService } from "src/provider/email/email.service";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [EventsController],
  providers: [EventsService, DatabaseService, EmailService, ConfigService]
})
export class EventsModule {}
