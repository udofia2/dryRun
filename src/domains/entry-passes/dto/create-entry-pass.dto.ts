import { ApiProperty } from "@nestjs/swagger";
import { Invite, TICKETTYPE } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from "class-validator";
import { InviteDto } from "src/common/dtos/invite.dto";

export enum ATTENDEETYPE {
  INDIVIDUAL = "INDIVIDUAL",
  ORGANIZATION = "ORGANIZATION"
}

export interface AttendeeDetail {
  name: string;
  contact: string;
  affiliation_or_organization: string;
  organization_name: string;
  organization_contact: string;
  representative_name: string;
  attendee_type: ATTENDEETYPE;
}
import {
  CLIENTTYPE,
  ENTRYPASSTYPE,
  LOCATIONTYPE,
  STOCKTYPE
} from "src/constants";

export class ATTENDEEDETAILS {
  @ApiProperty({
    description: "Name of the attendee",
    example: "John Doe",
    required: false
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: "Contact information of the attendee",
    example: "+1234567890",
    required: false
  })
  @IsString()
  @IsOptional()
  contact: string;

  @ApiProperty({
    description: "Affiliation or organization of the attendee",
    example: "Tech Corp",
    required: false
  })
  @IsString()
  @IsOptional()
  "affiliation_or_organization": string;

  @ApiProperty({
    description: "Name of the organization",
    example: "Tech Corporation Ltd",
    required: false
  })
  @IsString()
  @IsOptional()
  organization_name: string;

  @ApiProperty({
    description: "Contact information of the organization",
    example: "+1987654321",
    required: false
  })
  @IsString()
  @IsOptional()
  organization_contact: string;

  @ApiProperty({
    description: "Name of the representative",
    example: "Jane Smith",
    required: false
  })
  @IsString()
  @IsOptional()
  representative_name: string;

  @ApiProperty({
    description: "ID of the user if the user is login",
    example: "12345-67890-abcdef",
    required: false
  })
  @IsString()
  @IsOptional()
  user_id: string;

  @ApiProperty({
    description: "the attendee type",
    example: "INDIVIDUAL"
  })
  @IsString()
  @IsEnum(CLIENTTYPE)
  attendee_type: CLIENTTYPE;
}

export class EventDetails {
  @ApiProperty({
    description: "Event name to be associated with the pass",
    example: "Tech Conference 2025",
    required: false
  })
  @IsString()
  @IsOptional()
  event_name: string;

  @ApiProperty({
    description: "Event type to be associated with the pass",
    example: "Conference",
    required: false
  })
  @IsString()
  @IsOptional()
  event_type: string;

  @ApiProperty({
    description: "Description of the event this pass belongs to",
    example: "A premier tech conference focusing on AI and robotics.",
    required: false
  })
  @IsString()
  @IsOptional()
  event_description: string;

  @ApiProperty({
    description: "Link to the event this pass belongs to",
    example: "vip-conference-2025",
    required: false
  })
  @IsString()
  @IsOptional()
  event_link: string;

  @ApiProperty({
    description: "Type of location (e.g., virtual or physical)",
    required: false,
    example: "in_person"
  })
  @IsString()
  @IsEnum(LOCATIONTYPE)
  @IsOptional()
  location_type: LOCATIONTYPE;
}

export class CreateEntryPassDto {
  @ApiProperty({
    description: "Name of the entry pass",
    type: String,
    example: "VIP Pass"
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Type of the entry pass",
    example: "invite_only"
  })
  @IsString()
  @IsEnum(ENTRYPASSTYPE)
  type: ENTRYPASSTYPE;

  @ApiProperty({
    description: "Reservation limit for the entry pass",
    required: false,
    example: 100
  })
  @IsNumber()
  @IsOptional()
  reservation_limit: number;

  @ApiProperty({
    description: "Reservation limit for the entry pass",
    required: false,
    example: 100
  })
  @IsNumber()
  @IsOptional()
  stock_limit: number;

  @ApiProperty({
    description: "Description of the entry pass",
    required: false,
    example: "Access to exclusive areas"
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: "Price of the entry pass",
    required: false,
    example: 50
  })
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty({
    description: "Whether the processing fee is transferred to the guest",
    required: false,
    example: true
  })
  @IsBoolean()
  @IsOptional()
  transfer_processing_fee_to_guest: boolean;

  @ApiProperty({
    description: "Ticket type associated with the entry pass",
    required: false,
    example: "paid"
  })
  @IsString()
  @IsOptional()
  @IsEnum(TICKETTYPE)
  ticket_type: TICKETTYPE;

  @ApiProperty({
    description: "Stock type associated with the entry pass",
    required: false,
    example: "unlimited"
    // type: STOCKTYPE
  })
  @IsString()
  @IsOptional()
  @IsEnum(STOCKTYPE)
  stock_type: STOCKTYPE;

  @ApiProperty({
    description: "Invite associated with the entry pass",
    required: false,
    type: InviteDto
  })
  @IsOptional()
  invite: InviteDto;

  @ApiProperty({
    description: "ID of the event this pass belongs to",
    example: "e10253de-9eed-4789-a2e6-0f6fb8fc866c",
    type: IsUUID
  })
  @IsUUID()
  @IsOptional()
  event_id: string;

  // @IsOptional()
  @ValidateNested()
  @ApiProperty({
    type: EventDetails,
    description: "The Event detail for the entry pass"
  })
  @Type(() => EventDetails)
  event: EventDetails;
}
