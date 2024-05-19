import { IsString, IsNotEmpty, IsOptional, isNotEmpty } from "class-validator";
import { EntryPass } from "src/constants";
import { Specification } from "src/prospects/dto";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  date: Date;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsNotEmpty()
  location_type: string;

  @IsString()
  @IsOptional()
  virtual_meeting_link: string;

  @IsString()
  @IsOptional()
  location_address: string;

  @IsString()
  schedule_type: string;

  @IsString()
  start_date: Date;

  @IsString()
  start_time: string;

  @IsString()
  end_date: Date;

  @IsString()
  end_time: string;

  @IsString()
  @IsOptional()
  recurring_frequency: string;

  @IsString()
  @IsOptional()
  facebook_link: string;

  @IsString()
  @IsOptional()
  instagram_link: string;

  @IsString()
  @IsOptional()
  x_link: string;

  @IsString()
  @IsOptional()
  website_link: string;

  @IsString()
  @IsOptional()
  cover_art_url: string;

  @IsString()
  @IsOptional()
  exhibitor_id: string;

  @IsString()
  @IsOptional()
  client_email: string;

  @IsString()
  @IsOptional()
  prospect_id: string;

  @IsOptional()
  specification: Specification;

  @IsNotEmpty()
  entry_passes: EntryPass[];
}
