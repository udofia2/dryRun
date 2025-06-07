// src/providers/push/providers/expo.provider.ts
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IPushProvider,
  PushNotification,
  PushResponse
} from "../interfaces/push.interface";

@Injectable()
export class ExpoPushProvider implements IPushProvider {
  private readonly logger = new Logger(ExpoPushProvider.name);
  private expo: any; // Expo push client

  constructor(private configService: ConfigService) {
    this.initializeExpo();
  }

  private initializeExpo(): void {
    try {
      // In production, install: npm install expo-server-sdk
      // const { Expo } = require('expo-server-sdk');
      // this.expo = new Expo({
      //   accessToken: this.configService.get('EXPO_ACCESS_TOKEN'),
      // });

      // Mock for development
      this.expo = {
        isExpoPushToken: (token: string) =>
          token.startsWith("ExponentPushToken"),
        chunkPushNotifications: (notifications: any[]) => [notifications],
        sendPushNotificationsAsync: async (chunk: any[]) => [
          {
            status: "ok",
            id: `expo-${Math.random().toString(36).substr(2, 16)}`
          }
        ]
      };
    } catch (error) {
      this.logger.error("Failed to initialize Expo client", error);
    }
  }

  async send(notification: PushNotification): Promise<PushResponse> {
    try {
      this.logger.log(
        `Sending push notification via Expo to token: ${notification.deviceToken?.substring(0, 20)}...`
      );

      if (!notification.deviceToken) {
        throw new Error("Device token is required");
      }

      if (!this.expo.isExpoPushToken(notification.deviceToken)) {
        throw new Error("Invalid Expo push token");
      }

      const message = {
        to: notification.deviceToken,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || "default",
        badge: notification.badge,
        priority: notification.priority || "normal",
        ...(notification.ttl && {
          expiration: Math.floor(Date.now() / 1000) + notification.ttl
        }),
        ...(notification.category && { categoryId: notification.category }),
        ...(notification.collapseKey && {
          collapseId: notification.collapseKey
        })
      };

      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = await this.expo.sendPushNotificationsAsync(chunks[0]);

      const ticket = tickets[0];

      if (ticket.status === "ok") {
        this.logger.log(
          `Push notification sent successfully via Expo. Ticket ID: ${ticket.id}`
        );
        return {
          success: true,
          messageId: ticket.id,
          providerId: "expo",
          timestamp: new Date()
        };
      } else {
        throw new Error(ticket.message || "Unknown Expo error");
      }
    } catch (error) {
      this.logger.error(`Failed to send push notification via Expo`, error);
      return {
        success: false,
        messageId: "",
        providerId: "expo",
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
        `Sending bulk push notification via Expo to ${tokens.length} devices`
      );

      const messages = tokens.map((token) => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || "default",
        badge: notification.badge,
        priority: notification.priority || "normal"
      }));

      const chunks = this.expo.chunkPushNotifications(messages);
      const allTickets = [];

      for (const chunk of chunks) {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        allTickets.push(...tickets);
      }

      return allTickets.map((ticket: any, index: number) => ({
        success: ticket.status === "ok",
        messageId: ticket.id || "",
        providerId: "expo",
        failureReason: ticket.message,
        timestamp: new Date()
      }));
    } catch (error) {
      this.logger.error(
        "Failed to send bulk push notification via Expo",
        error
      );
      return tokens.map(() => ({
        success: false,
        messageId: "",
        providerId: "expo",
        failureReason: error.message,
        timestamp: new Date()
      }));
    }
  }

  validateToken(token: string): boolean {
    return this.expo.isExpoPushToken(token);
  }

  getProviderName(): string {
    return "Expo Push Notifications";
  }
}
