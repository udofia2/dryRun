import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ISmsProvider,
  SmsOptions,
  SmsResponse
} from "./interfaces/sms.interface";
import { TwilioSmsProvider } from "./providers/twilio.provider";
import { AwsSnsProvider } from "./providers/aws-sns.provider";
import { LocalSmsProvider } from "./providers/local.provider";
import { SendSmsDto } from "./dto/send-sms.dto";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private provider: ISmsProvider;

  constructor(
    private configService: ConfigService,
    private twilioProvider: TwilioSmsProvider,
    private awsSnsProvider: AwsSnsProvider,
    private localProvider: LocalSmsProvider
  ) {
    this.initializeProvider();
  }

  private initializeProvider(): void {
    const providerName = this.configService.get("SMS_PROVIDER", "local");

    switch (providerName) {
      case "twilio":
        this.provider = this.twilioProvider;
        break;
      case "aws-sns":
        this.provider = this.awsSnsProvider;
        break;
      case "local":
      default:
        this.provider = this.localProvider;
        break;
    }

    this.logger.log(
      `SMS Service initialized with provider: ${this.provider.getProviderName()}`
    );
  }

  async send(
    to: string,
    message: string,
    options?: SmsOptions
  ): Promise<SmsResponse> {
    try {
      this.logger.log(
        `Sending SMS to: ${to} via ${this.provider.getProviderName()}`
      );

      const response = await this.provider.send(to, message, options);

      if (response.success) {
        this.logger.log(`SMS sent successfully. ID: ${response.messageId}`);
      } else {
        this.logger.error(`SMS failed: ${response.error}`);
      }

      return response;
    } catch (error) {
      this.logger.error(`SMS service error for ${to}:`, error);
      return {
        success: false,
        messageId: "",
        status: "failed",
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async sendDto(sendSmsDto: SendSmsDto): Promise<SmsResponse> {
    const options: SmsOptions = {
      from: sendSmsDto.from,
      priority: sendSmsDto.priority,
      type: sendSmsDto.type,
      scheduledAt: sendSmsDto.scheduledAt
        ? new Date(sendSmsDto.scheduledAt)
        : undefined
    };

    return this.send(sendSmsDto.to, sendSmsDto.message, options);
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    return this.provider.validatePhoneNumber(phoneNumber);
  }

  getProviderInfo(): string {
    return this.provider.getProviderName();
  }

  async sendBulk(
    recipients: string[],
    message: string,
    options?: SmsOptions
  ): Promise<SmsResponse[]> {
    this.logger.log(`Sending bulk SMS to ${recipients.length} recipients`);

    const promises = recipients.map((to) => this.send(to, message, options));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        this.logger.error(
          `Bulk SMS failed for ${recipients[index]}:`,
          result.reason
        );
        return {
          success: false,
          messageId: "",
          status: "failed" as const,
          error: result.reason?.message || "Unknown error",
          timestamp: new Date()
        };
      }
    });
  }

  async sendOtp(phoneNumber: string, code: string): Promise<SmsResponse> {
    const message = `Your verification code is: ${code}. This code will expire in 10 minutes.`;

    return this.send(phoneNumber, message, {
      type: "otp",
      priority: "high"
    });
  }
}
