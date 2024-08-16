import { Module } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { DatabaseService } from "src/database/database.service";
import { EventsService } from "src/events/events.service";

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, DatabaseService, EventsService]
})
export class ContractsModule {}
