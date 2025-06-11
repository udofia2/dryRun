import { Module } from "@nestjs/common";
import { OrganizationService } from "./organization.service";
import { OrganizationController } from "./organization.controller";
import { DatabaseModule } from "src/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService]
})
export class OrganizationModule {}
