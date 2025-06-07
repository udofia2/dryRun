import { Injectable, Logger } from "@nestjs/common";
import {
  ISmsProvider,
  SmsOptions,
  SmsResponse
} from "../interfaces/sms.interface";

@Injectable()
export class LocalSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(LocalSmsProvider.name);

  async send(
    to: string,
    message: string,
    options?: SmsOptions
  ): Promise<SmsResponse> {
    try {
      this.logger.log(`[LOCAL SMS] To: ${to}`);
      this.logger.log(`[LOCAL SMS] Message: ${message}`);
      this.logger.log(`[LOCAL SMS] Options: ${JSON.stringify(options)}`);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const messageId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

      return {
        success: true,
        messageId,
        providerId: "local",
        status: "sent",
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Failed to send local SMS to: ${to}`, error);
      return {
        success: false,
        messageId: "",
        providerId: "local",
        status: "failed",
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    return phoneNumber.length > 0;
  }

  getProviderName(): string {
    return "Local Development";
  }
}
