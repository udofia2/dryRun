import { ApiProperty } from "@nestjs/swagger";
import {
  IsUUID,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsEnum,
  MinLength,
  MaxLength
} from "class-validator";
import { NotificationFeature } from "./create-notification.dto";

export enum NOTIFICATIONTYPE {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical"
}

export class SendNotificationDto {
  @ApiProperty({
    description: "User ID to send notification to",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @IsUUID("4")
  userId: string;

  @ApiProperty({
    description: "User email for email notifications",
    example: "user@example.com"
  })
  @IsEmail()
  userEmail: string;

  @ApiProperty({
    description: "User phone for SMS notifications (optional)",
    example: "+1234567890",
    required: false
  })
  @IsOptional()
  @IsPhoneNumber()
  userPhone?: string;

  @ApiProperty({
    description: "Device token for push notifications (optional)",
    required: false
  })
  @IsOptional()
  @IsString()
  deviceToken?: string;

  @ApiProperty({
    description: "Notification feature/category",
    enum: NotificationFeature
  })
  @IsEnum(NotificationFeature)
  feature: NotificationFeature;

  @ApiProperty({
    description: "Notification message",
    example: "Your payment has been processed successfully"
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  message: string;

  @ApiProperty({
    description: "Notification priority type",
    enum: NOTIFICATIONTYPE,
    example: NOTIFICATIONTYPE.INFO
  })
  @IsEnum(NOTIFICATIONTYPE)
  type: NOTIFICATIONTYPE;
}
