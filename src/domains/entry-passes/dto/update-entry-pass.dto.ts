import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { ENTRYPASSTYPE, STOCKTYPE } from "@prisma/client";
import { InviteDto } from "src/common/dtos/invite.dto";
import { ATTENDEEDETAILS, EventDetails } from "./create-entry-pass.dto";

export class UpdateEntryPassDto {
  @ApiProperty({
    description: "Name of the entry pass",
    type: String,
    example: "VIP Pass",
    required: false
  })
  @IsString()
  @IsOptional()
  pass_name?: string;

  @ApiProperty({
    description: "Type of the entry pass",
    example: "invite_only",
    required: false
  })
  @IsString()
  @IsEnum(ENTRYPASSTYPE)
  @IsOptional()
  type?: ENTRYPASSTYPE;

  @ApiProperty({
    description: "Reservation limit for the entry pass",
    required: false,
    example: 100
  })
  @IsNumber()
  @IsOptional()
  reservation_limit?: number;

  @ApiProperty({
    description: "Description of the entry pass",
    required: false,
    example: "Access to exclusive areas"
  })
  @IsString()
  @IsOptional()
  pass_description?: string;

  @ApiProperty({
    description: "Price of the entry pass",
    required: false,
    example: 50
  })
  @IsNumber()
  @IsOptional()
  pass_price?: number;

  @ApiProperty({
    description: "Whether the processing fee is transferred to the guest",
    required: false,
    example: true
  })
  @IsBoolean()
  @IsOptional()
  transfer_processing_fee_to_guest?: boolean;

  @ApiProperty({
    description: "Ticket type associated with the entry pass",
    required: false,
    example: "free"
  })
  @IsString()
  @IsOptional()
  ticket_type?: string;

  @ApiProperty({
    description: "Stock type associated with the entry pass",
    required: false,
    example: "unlimited"
  })
  @IsString()
  @IsOptional()
  @IsEnum(STOCKTYPE)
  stock_type?: STOCKTYPE;

  @ApiProperty({
    description: "Invite associated with the entry pass",
    required: false,
    type: InviteDto
  })
  @IsOptional()
  invite?: InviteDto;

  @ApiProperty({
    description: "The details of the attendee for the entry pass",
    required: false
  })
  @ValidateNested()
  @Type(() => ATTENDEEDETAILS)
  @IsOptional()
  attendee?: ATTENDEEDETAILS[];

  @ApiProperty({
    description: "The event details for the entry pass",
    required: false,
    type: EventDetails
  })
  @ValidateNested()
  @Type(() => EventDetails)
  @IsOptional()
  eventDetails?: EventDetails;
}
