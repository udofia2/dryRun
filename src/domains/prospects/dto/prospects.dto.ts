import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsDateString
} from "class-validator";
import { CreateClientDto } from "src/common/dtos";
import { EVENTSOURCE } from "@prisma/client";

class Activity {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  vendor_name: string;

  @IsDateString({ strict: true })
  start_date: Date;

  @IsDateString({ strict: true })
  end_date: Date;

  @IsNumber()
  amount: number;
}

class Provision {
  @IsString()
  provision: string;

  @IsString()
  description: string;

  @IsString()
  vendor_name: string;

  @IsDateString({ strict: true })
  start_date: Date;

  @IsDateString({ strict: true })
  end_date: Date;

  @IsNumber()
  amount: number;
}

export class Specification {
  @IsString()
  // @IsNotEmpty()
  theme: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Activity)
  activities: Activity[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Provision)
  provisions: Provision[];
}

export class Event {
  @IsString()
  name: string;

  @IsString()
  date: string;

  @IsString()
  type: string;

  @IsString()
  description: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  location_type: string;

  @IsString()
  location_address: string;
}

export class CreateProspectDto {
  @IsString()
  source: EVENTSOURCE;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Specification)
  specification: Specification;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateClientDto)
  client: CreateClientDto;

  @IsNotEmpty()
  event: Event;
}
