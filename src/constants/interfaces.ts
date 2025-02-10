import { ApiProperty } from "@nestjs/swagger";
import { EXHIBITTYPE, Invite } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";
import { InviteDto } from "src/common/dtos/invite.dto";

export const ExhibitType = new Set(Object.values(EXHIBITTYPE));

// export enum CLIENTTYPE {
//   "individual" = "individual",
//   "company/organization" = "company/organization"
// }
export enum CLIENTTYPE {
  INDIVIDUAL = "INDIVIDUAL",
  ORGANIZATION = "ORGANIZATION"
}

export enum LOCATIONTYPE {
  in_person = "in_person",
  virtual = "virtual",
  hybrid = "hybrid"
}

export enum SOURCETYPE {
  "offline" = "Offline",
  "online" = "Online"
}

export enum STATUSTYPE {
  "pending" = "pending",
  "converted" = "converted",
  "rejected" = "rejected"
}

export enum OFFERSTATUSTYPE {
  "pending" = "Pending",
  "accepted" = "Accepted",
  "rejected" = "Rejected"
}

export enum ENTRYPASSTYPE {
  "free" = "free",
  "paid" = "paid",
  "invite_only" = "invite_only"
}

export enum STOCKTYPE {
  "unlimited" = "unlimited",
  "limited" = "limited"
}

export enum VIRTUALLOCATIONTYPE {
  "zoom" = "Zoom",
  "google_meet" = "Google Meet"
}

export type EVENTSOURCE = "offline" | "online";

export class EntryPass {
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
    description: "Stock type of the entry pass",
    required: false,
    example: "Limited"
  })
  @IsString()
  @IsOptional()
  stock_type: string;

  @ApiProperty({
    description: "Reservation limit for the entry pass",
    required: false,
    example: 100
  })
  @IsNumber()
  @IsOptional()
  reservation_limit: number;

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
    example: "free"
  })
  @IsString()
  @IsOptional()
  ticket_type: string;

  @ApiProperty({
    description: "Invite associated with the entry pass",
    required: false,
    type: InviteDto
  })
  @IsOptional()
  invite: Invite;
}
