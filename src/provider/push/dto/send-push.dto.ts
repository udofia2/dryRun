import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  IsUUID,
  MinLength,
  MaxLength
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SendPushDto {
  @ApiProperty({
    description: "Push notification title",
    example: "New Message",
    maxLength: 100
  })
  @IsString()
  @MinLength(1, { message: "Title cannot be empty" })
  @MaxLength(100, { message: "Title too long" })
  title: string;

  @ApiProperty({
    description: "Push notification body/message",
    example: "You have received a new message from John Doe",
    maxLength: 500
  })
  @IsString()
  @MinLength(1, { message: "Body cannot be empty" })
  @MaxLength(500, { message: "Body too long" })
  body: string;

  @ApiPropertyOptional({
    description: "Device token for single device push",
    example: "dGhpcyBpcyBhIGZha2UgdG9rZW4="
  })
  @IsOptional()
  @IsString()
  deviceToken?: string;

  @ApiPropertyOptional({
    description: "User ID to send push to (will look up device tokens)",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @IsOptional()
  @IsUUID("4")
  userId?: string;

  @ApiPropertyOptional({
    description: "Additional data payload",
    example: { orderId: "123", type: "order_update" }
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: "App badge number",
    example: 5
  })
  @IsOptional()
  @IsNumber()
  badge?: number;

  @ApiPropertyOptional({
    description: "Notification sound",
    example: "default"
  })
  @IsOptional()
  @IsString()
  sound?: string;

  @ApiPropertyOptional({
    description: "Notification priority",
    enum: ["low", "normal", "high"],
    example: "normal"
  })
  @IsOptional()
  @IsEnum(["low", "normal", "high"])
  priority?: "low" | "normal" | "high";

  @ApiPropertyOptional({
    description: "Notification category",
    example: "message"
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: "Image URL for rich notifications",
    example: "https://example.com/image.jpg"
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: "Click action URL",
    example: "/messages/123"
  })
  @IsOptional()
  @IsString()
  clickAction?: string;

  @ApiPropertyOptional({
    description: "Time to live in seconds",
    example: 3600
  })
  @IsOptional()
  @IsNumber()
  ttl?: number;
}

export class BulkPushDto {
  @ApiProperty({
    description: "Array of device tokens",
    example: ["token1", "token2", "token3"],
    type: [String]
  })
  @IsString({ each: true })
  deviceTokens: string[];

  @ApiProperty({
    description: "Push notification title",
    example: "System Update"
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: "Push notification body",
    example: "A new system update is available"
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  body: string;

  @ApiPropertyOptional({
    description: "Additional data payload",
    example: { updateVersion: "2.1.0" }
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
