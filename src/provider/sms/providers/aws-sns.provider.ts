import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ISmsProvider,
  SmsOptions,
  SmsResponse
} from "../interfaces/sms.interface";

@Injectable()
export class AwsSnsProvider implements ISmsProvider {
  private readonly logger = new Logger(AwsSnsProvider.name);
  private sns: any; // AWS SNS client

  constructor(private configService: ConfigService) {
    this.initializeAwsSns();
  }

  private initializeAwsSns(): void {
    try {
      // In production, install: npm install @aws-sdk/client-sns
      // import { SNSClient } from '@aws-sdk/client-sns';
      // this.sns = new SNSClient({
      //   region: this.configService.get('AWS_REGION'),
      //   credentials: {
      //     accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      //     secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      //   },
      // });

      // Mock for development
      this.sns = {
        publish: async (params: any) => ({
          MessageId: `aws-${Math.random().toString(36).substr(2, 16)}`,
          $metadata: { httpStatusCode: 200 }
        })
      };
    } catch (error) {
      this.logger.error("Failed to initialize AWS SNS client", error);
    }
  }

  async send(
    to: string,
    message: string,
    options?: SmsOptions
  ): Promise<SmsResponse> {
    try {
      this.logger.log(`Sending SMS via AWS SNS to: ${to}`);

      if (!this.validatePhoneNumber(to)) {
        throw new Error("Invalid phone number format");
      }

      const params = {
        Message: message,
        PhoneNumber: to,
        MessageAttributes: {
          "AWS.SNS.SMS.SMSType": {
            DataType: "String",
            StringValue:
              options?.type === "otp" ? "Transactional" : "Promotional"
          },
          ...(options?.priority && {
            "AWS.SNS.SMS.MaxPrice": {
              DataType: "String",
              StringValue: options.priority === "high" ? "1.00" : "0.50"
            }
          })
        }
      };

      const result = await this.sns.publish(params);

      this.logger.log(
        `SMS sent successfully via AWS SNS. Message ID: ${result.MessageId}`
      );

      return {
        success: true,
        messageId: result.MessageId,
        providerId: "aws-sns",
        status: "sent",
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS via AWS SNS to: ${to}`, error);
      return {
        success: false,
        messageId: "",
        providerId: "aws-sns",
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
    return "AWS SNS";
  }
}
