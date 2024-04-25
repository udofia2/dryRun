import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEmail
} from "class-validator";

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

class Specification {
  @IsString()
  @IsNotEmpty()
  theme: string;

  @IsNotEmpty()
  activities: Activity[];

  @IsNotEmpty()
  provisions: Provision[];
}

class Client {
  @IsEmail()
  email: string;

  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  phone_number: string;
}

class Event {
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
  client_name: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsNotEmpty()
  specification: Specification;

  @IsNotEmpty()
  client: Client;

  @IsNotEmpty()
  event: Event;
}
