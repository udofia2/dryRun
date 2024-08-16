import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested
} from "class-validator";
import { CreateClientDto } from "src/common/dtos";

class Activity {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  exhibitor_name: string;

  @IsString()
  start_date: Date;

  @IsString()
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
  exhibitor_name: string;

  @IsString()
  start_date: Date;

  @IsString()
  end_date: Date;

  @IsNumber()
  amount: number;
}

export class Specification {
  @IsString()
  // @IsNotEmpty()
  theme: string;

  @IsNotEmpty()
  activities: Activity[];

  @IsNotEmpty()
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
  @IsNotEmpty()
  source: string;

  @IsNotEmpty()
  specification: Specification;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateClientDto)
  client: CreateClientDto;

  @IsNotEmpty()
  event: Event;
}
