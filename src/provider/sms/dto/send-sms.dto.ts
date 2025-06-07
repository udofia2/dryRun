import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SendSmsDto {
  @ApiProperty({
    description: "Phone number to send SMS to",
    example: "+1234567890"
  })
  @IsPhoneNumber(null, { message: "Invalid phone number format" })
  to: string;

  @ApiProperty({
    description: "SMS message content",
    example: "Your verification code is: 123456",
    minLength: 1,
    maxLength: 1600 // SMS character limit
  })
  @IsString()
  @MinLength(1, { message: "Message cannot be empty" })
  @MaxLength(1600, { message: "Message exceeds SMS character limit" })
  message: string;

  @ApiPropertyOptional({
    description: "Sender phone number or ID",
    example: "+1987654321"
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: "Message priority",
    enum: ["low", "normal", "high"],
    example: "normal"
  })
  @IsOptional()
  @IsEnum(["low", "normal", "high"])
  priority?: "low" | "normal" | "high";

  @ApiPropertyOptional({
    description: "SMS type",
    enum: ["promotional", "transactional", "otp"],
    example: "transactional"
  })
  @IsOptional()
  @IsEnum(["promotional", "transactional", "otp"])
  type?: "promotional" | "transactional" | "otp";

  @ApiPropertyOptional({
    description: "Schedule SMS for later delivery",
    example: "2024-12-25T10:00:00.000Z"
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
