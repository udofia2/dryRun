import { Module } from "@nestjs/common";
import { OfferService } from "./offer.service";
import { OfferController } from "./offer.controller";
import { DatabaseService } from "src/database/database.service";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { EmailService } from "src/provider/email/email.service";
// import { EmailModule } from "src/provider/email/email.module";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [OfferController],
  providers: [
    OfferService,
    DatabaseService,
    NotificationsService,
    EmailService,
    ConfigService
  ]
})
export class OfferModule {}
