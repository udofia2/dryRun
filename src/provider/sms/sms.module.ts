import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SmsService } from "./sms.service";
import { TwilioSmsProvider } from "./providers/twilio.provider";
import { AwsSnsProvider } from "./providers/aws-sns.provider";
import { LocalSmsProvider } from "./providers/local.provider";

@Module({
  imports: [ConfigModule],
  providers: [SmsService, TwilioSmsProvider, AwsSnsProvider, LocalSmsProvider],
  exports: [SmsService]
})
export class SmsModule {}
