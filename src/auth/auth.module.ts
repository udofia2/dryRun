import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { DatabaseService } from "src/database/database.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, DatabaseService]
})
export class AuthModule {}
