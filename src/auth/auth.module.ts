import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { DatabaseService } from "src/database/database.service";
import { OtpService } from "src/provider/otp/otp.service";
import { UsersModule } from "src/users/users.module";
import { FacebookStrategy, GoogleStrategy } from "./strategies";

@Module({
  controllers: [AuthController],
  imports: [UsersModule],
  providers: [
    AuthService,
    DatabaseService,
    OtpService,
    GoogleStrategy,
    FacebookStrategy
  ]
})
export class AuthModule {}
