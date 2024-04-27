import { Module } from "@nestjs/common";
import { OfferService } from "./offer.service";
import { OfferController } from "./offer.controller";
import { DatabaseService } from "src/database/database.service";

@Module({
  controllers: [OfferController],
  providers: [OfferService, DatabaseService]
})
export class OfferModule {}
