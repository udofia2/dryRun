import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IPushProvider,
  PushNotification,
  PushResponse
} from "./interfaces/push.interface";
import { FirebasePushProvider } from "./providers/firebase.provider";
import { ExpoPushProvider } from "./providers/expo.provider";
import { LocalPushProvider } from "./providers/local.provider";
import { SendPushDto, BulkPushDto } from "./dto/send-push.dto";

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private provider: IPushProvider;

  constructor(
    private configService: ConfigService,
    private firebaseProvider: FirebasePushProvider,
    private expoProvider: ExpoPushProvider,
    private localProvider: LocalPushProvider
  ) {
    this.initializeProvider();
  }

  private initializeProvider(): void {
    const providerName = this.configService.get("PUSH_PROVIDER", "local");

    switch (providerName) {
      case "firebase":
        this.provider = this.firebaseProvider;
        break;
      case "expo":
        this.provider = this.expoProvider;
        break;
      case "local":
      default:
        this.provider = this.localProvider;
        break;
    }

    this.logger.log(
      `Push Service initialized with provider: ${this.provider.getProviderName()}`
    );
  }

  async send(notification: PushNotification): Promise<PushResponse> {
    try {
      this.logger.log(
        `Sending push notification: "${notification.title}" via ${this.provider.getProviderName()}`
      );

      if (
        notification.deviceToken &&
        !this.provider.validateToken(notification.deviceToken)
      ) {
        throw new Error("Invalid device token format");
      }

      const response = await this.provider.send(notification);

      if (response.success) {
        this.logger.log(
          `Push notification sent successfully. ID: ${response.messageId}`
        );
      } else {
        this.logger.error(
          `Push notification failed: ${response.failureReason}`
        );
      }

      return response;
    } catch (error) {
      this.logger.error(`Push service error:`, error);
      return {
        success: false,
        messageId: "",
        providerId: this.provider.getProviderName().toLowerCase(),
        failureReason: error.message,
        timestamp: new Date()
      };
    }
  }

  async sendDto(sendPushDto: SendPushDto): Promise<PushResponse> {
    const notification: PushNotification = {
      title: sendPushDto.title,
      body: sendPushDto.body,
      deviceToken: sendPushDto.deviceToken,
      userId: sendPushDto.userId,
      data: sendPushDto.data,
      badge: sendPushDto.badge,
      sound: sendPushDto.sound,
      priority: sendPushDto.priority,
      category: sendPushDto.category,
      image: sendPushDto.image,
      clickAction: sendPushDto.clickAction,
      ttl: sendPushDto.ttl
    };

    return this.send(notification);
  }

  async sendToMultiple(
    tokens: string[],
    notification: PushNotification
  ): Promise<PushResponse[]> {
    try {
      this.logger.log(
        `Sending bulk push notification to ${tokens.length} devices`
      );

      const validTokens = tokens.filter((token) =>
        this.provider.validateToken(token)
      );

      if (validTokens.length !== tokens.length) {
        this.logger.warn(
          `${tokens.length - validTokens.length} invalid tokens filtered out`
        );
      }

      if (validTokens.length === 0) {
        throw new Error("No valid device tokens provided");
      }

      const responses = await this.provider.sendToMultiple(
        validTokens,
        notification
      );

      const successCount = responses.filter((r) => r.success).length;
      this.logger.log(
        `Bulk push completed: ${successCount}/${responses.length} successful`
      );

      return responses;
    } catch (error) {
      this.logger.error(`Bulk push service error:`, error);
      return tokens.map(() => ({
        success: false,
        messageId: "",
        providerId: this.provider.getProviderName().toLowerCase(),
        failureReason: error.message,
        timestamp: new Date()
      }));
    }
  }

  async sendBulkDto(bulkPushDto: BulkPushDto): Promise<PushResponse[]> {
    const notification: PushNotification = {
      title: bulkPushDto.title,
      body: bulkPushDto.body,
      data: bulkPushDto.data
    };

    return this.sendToMultiple(bulkPushDto.deviceTokens, notification);
  }

  async sendToUser(
    userId: string,
    notification: Omit<PushNotification, "userId">
  ): Promise<PushResponse[]> {
    try {
      // In a real implementation, you would:
      // 1. Query user's device tokens from database
      // 2. Send to all user's devices

      this.logger.log(`Sending push to user: ${userId}`);

      // Mock implementation - in reality you'd query the database
      const userDeviceTokens = await this.getUserDeviceTokens(userId);

      if (userDeviceTokens.length === 0) {
        this.logger.warn(`No device tokens found for user: ${userId}`);
        return [];
      }

      return this.sendToMultiple(userDeviceTokens, { ...notification, userId });
    } catch (error) {
      this.logger.error(`Failed to send push to user ${userId}:`, error);
      return [];
    }
  }

  private async getUserDeviceTokens(userId: string): Promise<string[]> {
    // Mock implementation - replace with actual database query
    // Example: return this.db.deviceToken.findMany({ where: { userId }, select: { token: true } })
    return [`mock_token_for_user_${userId}`];
  }

  validateToken(token: string): boolean {
    return this.provider.validateToken(token);
  }

  getProviderInfo(): string {
    return this.provider.getProviderName();
  }

  async sendWelcomeNotification(
    userId: string,
    userName: string
  ): Promise<PushResponse[]> {
    return this.sendToUser(userId, {
      title: "Welcome!",
      body: `Hello ${userName}! Welcome to our platform.`,
      data: { type: "welcome", userId },
      sound: "default",
      priority: "normal"
    });
  }

  async sendPaymentNotification(
    userId: string,
    amount: number,
    status: "success" | "failed"
  ): Promise<PushResponse[]> {
    const title =
      status === "success" ? "Payment Successful" : "Payment Failed";
    const body =
      status === "success"
        ? `Your payment of ${amount} has been processed successfully.`
        : `Your payment of ${amount} failed. Please try again.`;

    return this.sendToUser(userId, {
      title,
      body,
      data: { type: "payment", amount, status },
      sound: "default",
      priority: "high"
    });
  }

  async sendEventReminder(
    userId: string,
    eventName: string,
    startTime: Date
  ): Promise<PushResponse[]> {
    return this.sendToUser(userId, {
      title: "Event Reminder",
      body: `Your event "${eventName}" starts in 1 hour!`,
      data: {
        type: "event_reminder",
        eventName,
        startTime: startTime.toISOString()
      },
      sound: "default",
      priority: "normal"
    });
  }
}
