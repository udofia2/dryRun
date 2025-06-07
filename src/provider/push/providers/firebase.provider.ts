
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IPushProvider,
  PushNotification,
  PushResponse
} from "../interfaces/push.interface";

@Injectable()
export class FirebasePushProvider implements IPushProvider {
  private readonly logger = new Logger(FirebasePushProvider.name);
  private admin: any; // Firebase admin

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      // In production, install: npm install firebase-admin
      // const admin = require('firebase-admin');
      // const serviceAccount = JSON.parse(this.configService.get('FIREBASE_SERVICE_ACCOUNT'));
      //
      // admin.initializeApp({
      //   credential: admin.credential.cert(serviceAccount),
      //   projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      // });
      //
      // this.admin = admin;

      // Mock for development
      this.admin = {
        messaging: () => ({
          send: async (message: any) => ({
            name: `projects/test-project/messages/${Math.random().toString(36).substr(2, 16)}`
          }),
          sendMulticast: async (message: any) => ({
            responses: message.tokens.map(() => ({
              success: true,
              messageId: `firebase-${Math.random().toString(36).substr(2, 16)}`
            })),
            successCount: message.tokens.length,
            failureCount: 0
          })
        })
      };
    } catch (error) {
      this.logger.error("Failed to initialize Firebase Admin", error);
    }
  }

  async send(notification: PushNotification): Promise<PushResponse> {
    try {
      this.logger.log(
        `Sending push notification via Firebase to token: ${notification.deviceToken?.substring(0, 10)}...`
      );

      if (!notification.deviceToken) {
        throw new Error("Device token is required");
      }

      const message = {
        token: notification.deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.image && { imageUrl: notification.image })
        },
        data: notification.data || {},
        android: {
          priority: this.mapPriority(notification.priority),
          notification: {
            sound: notification.sound || "default",
            clickAction: notification.clickAction,
            ...(notification.image && { imageUrl: notification.image })
          },
          ...(notification.ttl && { ttl: notification.ttl * 1000 }),
          ...(notification.collapseKey && {
            collapseKey: notification.collapseKey
          })
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              badge: notification.badge,
              sound: notification.sound || "default",
              category: notification.category
            }
          },
          headers: {
            "apns-priority": notification.priority === "high" ? "10" : "5",
            ...(notification.ttl && {
              "apns-expiration":
                Math.floor(Date.now() / 1000) + notification.ttl
            })
          }
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: "/icon-192x192.png",
            ...(notification.image && { image: notification.image }),
            ...(notification.clickAction && {
              click_action: notification.clickAction
            })
          },
          ...(notification.ttl && {
            headers: { TTL: notification.ttl.toString() }
          })
        }
      };

      const response = await this.admin.messaging().send(message);

      this.logger.log(
        `Push notification sent successfully via Firebase. Message ID: ${response.name}`
      );

      return {
        success: true,
        messageId: response.name,
        providerId: "firebase",
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification via Firebase`, error);
      return {
        success: false,
        messageId: "",
        providerId: "firebase",
        failureReason: error.message,
        timestamp: new Date()
      };
    }
  }

  async sendToMultiple(
    tokens: string[],
    notification: PushNotification
  ): Promise<PushResponse[]> {
    try {
      this.logger.log(
        `Sending bulk push notification via Firebase to ${tokens.length} devices`
      );

      const message = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.image && { imageUrl: notification.image })
        },
        data: notification.data || {},
        android: {
          priority: this.mapPriority(notification.priority),
          notification: {
            sound: notification.sound || "default"
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              badge: notification.badge,
              sound: notification.sound || "default"
            }
          }
        }
      };

      const response = await this.admin.messaging().sendMulticast(message);

      this.logger.log(
        `Bulk push sent: ${response.successCount} success, ${response.failureCount} failures`
      );

      return response.responses.map((resp: any, index: number) => ({
        success: resp.success,
        messageId: resp.messageId || "",
        providerId: "firebase",
        failureReason: resp.error?.message,
        timestamp: new Date()
      }));
    } catch (error) {
      this.logger.error(
        "Failed to send bulk push notification via Firebase",
        error
      );
      return tokens.map(() => ({
        success: false,
        messageId: "",
        providerId: "firebase",
        failureReason: error.message,
        timestamp: new Date()
      }));
    }
  }

  validateToken(token: string): boolean {
    // Basic validation for Firebase tokens
    return (
      token &&
      token.length > 50 &&
      /^[A-Za-z0-9_-]+$/.test(token.replace(/:/g, ""))
    );
  }

  getProviderName(): string {
    return "Firebase Cloud Messaging";
  }

  private mapPriority(priority?: string): string {
    const priorityMap: Record<string, string> = {
      low: "normal",
      normal: "high",
      high: "high"
    };
    return priorityMap[priority || "normal"] || "high";
  }
}
