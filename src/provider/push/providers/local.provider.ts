import { Injectable, Logger } from "@nestjs/common";
import {
  IPushProvider,
  PushNotification,
  PushResponse
} from "../interfaces/push.interface";

@Injectable()
export class LocalPushProvider implements IPushProvider {
  private readonly logger = new Logger(LocalPushProvider.name);

  async send(notification: PushNotification): Promise<PushResponse> {
    try {
      this.logger.log(`[LOCAL PUSH] Title: ${notification.title}`);
      this.logger.log(`[LOCAL PUSH] Body: ${notification.body}`);
      this.logger.log(
        `[LOCAL PUSH] Token: ${notification.deviceToken?.substring(0, 10)}...`
      );
      this.logger.log(
        `[LOCAL PUSH] Data: ${JSON.stringify(notification.data)}`
      );

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 150));

      const messageId = `local-push-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

      return {
        success: true,
        messageId,
        providerId: "local",
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Failed to send local push notification`, error);
      return {
        success: false,
        messageId: "",
        providerId: "local",
        failureReason: error.message,
        timestamp: new Date()
      };
    }
  }

  async sendToMultiple(
    tokens: string[],
    notification: PushNotification
  ): Promise<PushResponse[]> {
    this.logger.log(`[LOCAL PUSH BULK] Sending to ${tokens.length} devices`);
    this.logger.log(`[LOCAL PUSH BULK] Title: ${notification.title}`);
    this.logger.log(`[LOCAL PUSH BULK] Body: ${notification.body}`);

    // Simulate processing each token
    return Promise.all(
      tokens.map(async (token, index) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          success: true,
          messageId: `local-bulk-${Date.now()}-${index}`,
          providerId: "local",
          timestamp: new Date()
        };
      })
    );
  }

  validateToken(token: string): boolean {
    return token && token.length > 0;
  }

  getProviderName(): string {
    return "Local Development";
  }
}
