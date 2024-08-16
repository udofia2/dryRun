import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { JwtModule } from "@nestjs/jwt";
import { ErrorModule } from "./error/error.module";
import { CacheModule } from "@nestjs/cache-manager";
import { ProspectsModule } from "./prospects/prospects.module";
import { OfferModule } from "./offer/offer.module";
import { EventsModule } from "./events/events.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ContractsModule } from "./contracts/contracts.module";
// import * as redisStore from "cache-manager-redis-store";

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    CacheModule.register({
      isGlobal: true
      // store: redisStore,
      // host: process.env.REDIS_HOST,
      // port: process.env.REDIS_PORT
    }),
    JwtModule.register({
      global: true
    }),
    ErrorModule,
    ProspectsModule,
    OfferModule,
    EventsModule,
    NotificationsModule,
    ContractsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
