import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ISmsProvider,
  SmsOptions,
  SmsResponse
} from "../interfaces/sms.interface";

@Injectable()
export class TwilioSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private client: any; // Twilio client

  constructor(private configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio(): void {
    try {
      // In production, install: npm install twilio
      // const twilio = require('twilio');
      // this.client = twilio(
      //   this.configService.get('TWILIO_ACCOUNT_SID'),
      //   this.configService.get('TWILIO_AUTH_TOKEN')
      // );

      // Mock for development
      this.client = {
        messages: {
          create: async (params: any) => ({
            sid: `SM${Math.random().toString(36).substr(2, 32)}`,
            status: "sent",
            price: "0.0075",
            dateCreated: new Date()
          })
        }
      };
    } catch (error) {
      this.logger.error("Failed to initialize Twilio client", error);
    }
  }

  async send(
    to: string,
    message: string,
    options?: SmsOptions
  ): Promise<SmsResponse> {
    try {
      this.logger.log(`Sending SMS via Twilio to: ${to}`);

      if (!this.validatePhoneNumber(to)) {
        throw new Error("Invalid phone number format");
      }

      const twilioMessage = await this.client.messages.create({
        body: message,
        from: options?.from || this.configService.get("TWILIO_FROM_NUMBER"),
        to: to,
        ...(options?.scheduledAt && { sendAt: options.scheduledAt }),
        ...(options?.callback && { statusCallback: options.callback })
      });

      this.logger.log(
        `SMS sent successfully via Twilio. Message ID: ${twilioMessage.sid}`
      );

      return {
        success: true,
        messageId: twilioMessage.sid,
        providerId: "twilio",
        cost: parseFloat(twilioMessage.price || "0"),
        status: this.mapTwilioStatus(twilioMessage.status),
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS via Twilio to: ${to}`, error);
      return {
        success: false,
        messageId: "",
        providerId: "twilio",
        status: "failed",
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  getProviderName(): string {
    return "Twilio";
  }

  private mapTwilioStatus(
    status: string
  ): "sent" | "queued" | "failed" | "delivered" {
    const statusMap: Record<
      string,
      "sent" | "queued" | "failed" | "delivered"
    > = {
      sent: "sent",
      queued: "queued",
      failed: "failed",
      delivered: "delivered",
      undelivered: "failed"
    };
    return statusMap[status] || "queued";
  }
}
