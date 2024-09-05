import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@nestjs/cache-manager";
import { ProspectsModule } from "./domains/prospects/prospects.module";
import { OfferModule } from "./domains/offer/offer.module";
import { EventsModule } from "./domains/events/events.module";
import { NotificationsModule } from "./domains/notifications/notifications.module";
import { ContractsModule } from "./domains/contracts/contracts.module";
import { ErrorService } from "./error/error.service";
import { UsersModule } from './users/users.module';
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
    ProspectsModule,
    OfferModule,
    EventsModule,
    NotificationsModule,
    ContractsModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, ErrorService]
})
export class AppModule {}
