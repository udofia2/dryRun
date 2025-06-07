import { Global, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { ConfigModule } from "@nestjs/config";
import { PrismaHealthIndicator } from "./prisma.health";
import { TerminusModule } from "@nestjs/terminus";

@Global()
@Module({
  imports: [ConfigModule, TerminusModule],
  controllers: [],
  providers: [DatabaseService, PrismaHealthIndicator],
  exports: [DatabaseService, PrismaHealthIndicator]
})
export class DatabaseModule {}
