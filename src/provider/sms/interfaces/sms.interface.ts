export interface ISmsProvider {
  send(to: string, message: string, options?: SmsOptions): Promise<SmsResponse>;
  validatePhoneNumber(phoneNumber: string): boolean;
  getProviderName(): string;
}

export interface SmsOptions {
  from?: string;
  priority?: "low" | "normal" | "high";
  type?: "promotional" | "transactional" | "otp";
  scheduledAt?: Date;
  callback?: string;
}

export interface SmsResponse {
  success: boolean;
  messageId: string;
  providerId?: string;
  cost?: number;
  status: "sent" | "queued" | "failed" | "delivered";
  error?: string;
  timestamp: Date;
}

export interface SmsConfig {
  provider: "twilio" | "aws-sns" | "nexmo" | "local";
  apiKey: string;
  apiSecret?: string;
  fromNumber: string;
  region?: string;
  accountSid?: string; // For Twilio
}
