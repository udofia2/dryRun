import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsDateString,
  IsEnum,
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from "class-validator";
import { SpecificationDto } from "src/common/dtos";
import { EntryPass, LOCATIONTYPE } from "src/constants";
import { ApiProperty } from "@nestjs/swagger";

// Custom validator for the link
function IsValidCustomLink(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isValidCustomLink",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Optional field
          const linkRegex = /^[a-zA-Z0-9-_]+$/;
          return typeof value === "string" && linkRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return "Custom link must contain only alphanumeric characters, dashes, and underscores";
        }
      }
    });
  };
}
export class CreateEventDto {
  @ApiProperty({
    description: "Name of the event",
    required: false,
    example: "Tech Conference 2025"
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: "Event date in ISO format (strict)",
    required: false,
    example: "2025-06-15T09:00:00Z"
  })
  @IsOptional()
  @IsDateString({ strict: true })
  date: Date;

  @ApiProperty({
    description: "Type of the event",
    required: false,
    example: "Conference"
  })
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty({
    description: "Link to the event",
    required: false,
    example: "vip-conference-2024"
  })
  @IsString()
  @IsOptional()
  @IsValidCustomLink({
    message:
      "Custom link must contain only alphanumeric characters, dashes, and underscores"
  })
  link: string;

  @ApiProperty({
    description: "Number of guests attending",
    required: false,
    example: 300
  })
  @IsNumber()
  @IsOptional()
  number_of_guests: number;

  @ApiProperty({
    description: "Description of the event",
    required: false,
    example: "A premier tech conference focusing on AI and robotics."
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: "City where the event is happening",
    required: false,
    example: "San Francisco"
  })
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty({
    description: "State where the event is happening",
    required: false,
    example: "California"
  })
  @IsString()
  @IsOptional()
  state: string;

  @ApiProperty({
    description: "Type of location (e.g., virtual or physical)",
    required: false,
    example: "In Person"
  })
  @IsString()
  @IsEnum(LOCATIONTYPE)
  @IsOptional()
  location_type: LOCATIONTYPE;

  @ApiProperty({
    description: "Location name or venue of the event",
    required: false,
    example: "Moscone Center"
  })
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty({
    description: "Link to the virtual meeting (if applicable)",
    required: false,
    example: "https://zoom.us/j/123456789"
  })
  @IsString()
  @IsOptional()
  virtual_meeting_link: string;

  @ApiProperty({
    description: "Address of the event location",
    required: false,
    example: "747 Howard St, San Francisco, CA 94103"
  })
  @IsString()
  @IsOptional()
  location_address: string;

  @ApiProperty({
    description: "Schedule type for the event",
    required: false,
    example: "One-time"
  })
  @IsString()
  @IsOptional()
  schedule_type: string;

  @ApiProperty({
    description: "Event start date in ISO format (strict)",
    required: false,
    example: "2025-06-15T09:00:00Z"
  })
  @IsOptional()
  @IsDateString({ strict: true })
  start_date: Date;

  @ApiProperty({
    description: "Start time of the event",
    required: false,
    example: "09:00 AM"
  })
  @IsString()
  @IsOptional()
  start_time: string;

  @ApiProperty({
    description: "Event end date in ISO format (strict)",
    required: false,
    example: "2025-06-15T17:00:00Z"
  })
  @IsOptional()
  @IsDateString({ strict: true })
  end_date: Date;

  @ApiProperty({
    description: "End time of the event",
    required: false,
    example: "05:00 PM"
  })
  @IsString()
  @IsOptional()
  end_time: string;

  @ApiProperty({
    description: "Frequency of event recurrence (if applicable)",
    required: false,
    example: "Weekly"
  })
  @IsString()
  @IsOptional()
  recurring_frequency: string;

  @ApiProperty({
    description: "Facebook link for the event",
    required: false,
    example: "https://facebook.com/event/12345"
  })
  @IsString()
  @IsOptional()
  facebook_link: string;

  @ApiProperty({
    description: "Instagram link for the event",
    required: false,
    example: "https://instagram.com/event/12345"
  })
  @IsString()
  @IsOptional()
  instagram_link: string;

  @ApiProperty({
    description: "X (formerly Twitter) link for the event",
    required: false,
    example: "https://twitter.com/event/12345"
  })
  @IsString()
  @IsOptional()
  x_link: string;

  @ApiProperty({
    description: "Official website link for the event",
    required: false,
    example: "https://example.com/event/123"
  })
  @IsString()
  @IsOptional()
  website_link: string;

  @ApiProperty({
    description: "Cover art URL for the event",
    required: false,
    example: "https://example.com/event-cover.jpg"
  })
  @IsString()
  @IsOptional()
  cover_art_url: string;

  @ApiProperty({
    description: "Vendor ID associated with the event",
    required: false,
    example: "vendor-12345"
  })
  @IsString()
  @IsOptional()
  vendor_id: string;

  @ApiProperty({
    description: "available number of entry passes",
    required: false,
    example: "300"
  })
  @IsNumber()
  @IsOptional()
  stock_available: number;

  @ApiProperty({
    description: "Client email for event notifications",
    required: false,
    example: "client@example.com"
  })
  @IsString()
  @IsOptional()
  client_email: string;

  @ApiProperty({
    description: "Prospect ID for the event",
    required: false,
    example: "prospect-98765"
  })
  @IsString()
  @IsOptional()
  prospect_id: string;

  @ApiProperty({
    description: "Event specification details",
    type: SpecificationDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationDto)
  specification: SpecificationDto;

  @ApiProperty({
    description: "List of entry passes for the event",
    type: [EntryPass],
    required: false
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => EntryPass)
  entry_passes: EntryPass[];
}
