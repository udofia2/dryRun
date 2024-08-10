import { EXHIBITTYPE, Invite } from "@prisma/client";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export const ExhibitType = new Set(Object.values(EXHIBITTYPE));

export enum CLIENTTYPE {
  "individual" = "Individual",
  "company/organization" = "Company/Organization"
}

export enum LOCATIONTYPE {
  "in_person" = "In Person",
  "virtual" = "Virtual",
  "hybrid" = "Hybrid"
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

export class EntryPass {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  stock_type: string;

  @IsNumber()
  @IsOptional()
  reservation_limit: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsBoolean()
  @IsOptional()
  transfer_processing_fee_to_guest: boolean;

  @IsString()
  @IsOptional()
  ticket_type: string;

  @IsOptional()
  invite: Invite;
}
