export interface IPushProvider {
  send(notification: PushNotification): Promise<PushResponse>;
  sendToMultiple(
    tokens: string[],
    notification: PushNotification
  ): Promise<PushResponse[]>;
  validateToken(token: string): boolean;
  getProviderName(): string;
}

export interface PushNotification {
  title: string;
  body: string;
  deviceToken?: string;
  userId?: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  priority?: "low" | "normal" | "high";
  category?: string;
  image?: string;
  clickAction?: string;
  ttl?: number; // Time to live in seconds
  collapseKey?: string;
}

export interface PushResponse {
  success: boolean;
  messageId: string;
  providerId: string;
  failureReason?: string;
  timestamp: Date;
  deliveryAttempts?: number;
}

export interface PushConfig {
  provider: "firebase" | "apns" | "expo" | "local";
  serverKey?: string;
  projectId?: string;
  privateKey?: string;
  teamId?: string;
  keyId?: string;
  bundleId?: string;
}
