import { Module } from "@nestjs/common";
import { EntryPassService } from "./entry-passes.service";
import { EntryPassController } from "./entry-passes.controller";
import { EmailService } from "src/provider/email/email.service";
import { DatabaseService } from "src/database/database.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [EntryPassController],
  providers: [EntryPassService, EmailService, DatabaseService]
})
export class EntryPassesModule {}
