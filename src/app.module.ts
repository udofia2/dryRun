import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { JwtModule } from "@nestjs/jwt";
import { ErrorModule } from "./error/error.module";

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    JwtModule.register({
      global: true
    }),
    ErrorModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
