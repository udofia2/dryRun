import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

// Define notification feature types for better type safety
export enum NotificationFeature {
  USER_MANAGEMENT = "user_management",
  EVENT_MANAGEMENT = "event_management",
  PAYMENT = "payment",
  BOOKING = "booking",
  SYSTEM = "system",
  SECURITY = "security",
  PROMOTION = "promotion",
  REMINDER = "reminder",
  CONTRACT = "contract",
  PROSPECT = "prospect",
  OFFER = "offer",
  INVOICE = "invoice"
}

export class CreateNotificationDto {
  @ApiProperty({
    description: "The feature or module that triggered this notification",
    example: "payment",
    enum: NotificationFeature,
    enumName: "NotificationFeature"
  })
  @IsEnum(NotificationFeature, {
    message: `Feature must be one of: ${Object.values(NotificationFeature).join(", ")}`
  })
  @IsNotEmpty({ message: "Feature is required" })
  feature: NotificationFeature;

  @ApiProperty({
    description: "The notification message content",
    example:
      "Your payment of $150.00 has been successfully processed for Event Registration.",
    minLength: 10,
    maxLength: 500
  })
  @IsString({ message: "Message must be a string" })
  @IsNotEmpty({ message: "Message is required" })
  @MinLength(10, { message: "Message must be at least 10 characters long" })
  @MaxLength(500, { message: "Message must not exceed 500 characters" })
  @Transform(({ value }) => value?.trim())
  message: string;

  @ApiProperty({
    description: "The ID of the user who will receive this notification",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid"
  })
  @IsUUID("4", { message: "User ID must be a valid UUID v4" })
  @IsNotEmpty({ message: "User ID is required" })
  user_id: string;

  @ApiPropertyOptional({
    description: "Custom date for the notification (defaults to current time)",
    example: "2024-12-25T10:00:00.000Z",
    format: "date-time"
  })
  @IsOptional()
  @IsDateString({}, { message: "Date must be a valid ISO 8601 date string" })
  date?: string;
}

// Update Notification DTO
export class UpdateNotificationDto {
  @ApiPropertyOptional({
    description: "The feature or module that triggered this notification",
    example: "system",
    enum: NotificationFeature,
    enumName: "NotificationFeature"
  })
  @IsOptional()
  @IsEnum(NotificationFeature, {
    message: `Feature must be one of: ${Object.values(NotificationFeature).join(", ")}`
  })
  feature?: NotificationFeature;

  @ApiPropertyOptional({
    description: "The notification message content",
    example: "Updated: Your payment has been confirmed and processed.",
    minLength: 10,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: "Message must be a string" })
  @MinLength(10, { message: "Message must be at least 10 characters long" })
  @MaxLength(500, { message: "Message must not exceed 500 characters" })
  @Transform(({ value }) => value?.trim())
  message?: string;

  @ApiPropertyOptional({
    description: "Custom date for the notification",
    example: "2024-12-25T10:00:00.000Z",
    format: "date-time"
  })
  @IsOptional()
  @IsDateString({}, { message: "Date must be a valid ISO 8601 date string" })
  date?: string;
}

// Query/Filter DTO for finding notifications
export class QueryNotificationDto {
  @ApiPropertyOptional({
    description: "Filter notifications by feature",
    example: "payment",
    enum: NotificationFeature,
    enumName: "NotificationFeature"
  })
  @IsOptional()
  @IsEnum(NotificationFeature, {
    message: `Feature must be one of: ${Object.values(NotificationFeature).join(", ")}`
  })
  feature?: NotificationFeature;

  @ApiPropertyOptional({
    description: "Filter notifications by user ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid"
  })
  @IsOptional()
  @IsUUID("4", { message: "User ID must be a valid UUID v4" })
  user_id?: string;

  @ApiPropertyOptional({
    description: "Number of notifications to return (pagination)",
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Number of notifications to skip (pagination)",
    example: 0,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @ApiPropertyOptional({
    description: "Search in notification messages",
    example: "payment",
    minLength: 3,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: "Search term must be a string" })
  @MinLength(3, { message: "Search term must be at least 3 characters long" })
  @MaxLength(100, { message: "Search term must not exceed 100 characters" })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: "Start date for filtering notifications",
    example: "2024-01-01T00:00:00.000Z",
    format: "date-time"
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "Start date must be a valid ISO 8601 date string" }
  )
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for filtering notifications",
    example: "2024-12-31T23:59:59.999Z",
    format: "date-time"
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "End date must be a valid ISO 8601 date string" }
  )
  endDate?: string;
}

// Bulk operations DTO
export class BulkNotificationDto {
  @ApiProperty({
    description: "Array of user IDs to send notifications to",
    example: [
      "550e8400-e29b-41d4-a716-446655440000",
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
    ],
    type: [String]
  })
  @IsUUID("4", { each: true, message: "All user IDs must be valid UUID v4" })
  @IsNotEmpty({ message: "User IDs array cannot be empty" })
  user_ids: string[];

  @ApiProperty({
    description: "The feature or module that triggered this notification",
    example: "system",
    enum: NotificationFeature,
    enumName: "NotificationFeature"
  })
  @IsEnum(NotificationFeature, {
    message: `Feature must be one of: ${Object.values(NotificationFeature).join(", ")}`
  })
  @IsNotEmpty({ message: "Feature is required" })
  feature: NotificationFeature;

  @ApiProperty({
    description: "The notification message content for all users",
    example:
      "System maintenance will be performed on December 25th from 2:00 AM to 4:00 AM.",
    minLength: 10,
    maxLength: 500
  })
  @IsString({ message: "Message must be a string" })
  @IsNotEmpty({ message: "Message is required" })
  @MinLength(10, { message: "Message must be at least 10 characters long" })
  @MaxLength(500, { message: "Message must not exceed 500 characters" })
  @Transform(({ value }) => value?.trim())
  message: string;
}
