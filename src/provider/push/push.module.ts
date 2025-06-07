import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PushService } from "./push.service";
import { FirebasePushProvider } from "./providers/firebase.provider";
import { ExpoPushProvider } from "./providers/expo.provider";
import { LocalPushProvider } from "./providers/local.provider";

@Module({
  imports: [ConfigModule],
  providers: [
    PushService,
    FirebasePushProvider,
    ExpoPushProvider,
    LocalPushProvider
  ],
  exports: [PushService]
})
export class PushModule {}
