import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { DatabaseService } from "src/database/database.service";
import { OtpService } from "src/provider/otp/otp.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, DatabaseService, OtpService]
})
export class AuthModule {}
