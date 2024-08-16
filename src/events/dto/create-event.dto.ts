import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested
} from "class-validator";
import { SpecificationDto } from "src/common/dtos";
import { EntryPass } from "src/constants";

export class CreateEventDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  date: Date;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  link: string;

  @IsNumber()
  @IsOptional()
  number_of_guests: number;

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
  @IsOptional()
  location_type: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  virtual_meeting_link: string;

  @IsString()
  @IsOptional()
  location_address: string;

  @IsString()
  @IsOptional()
  schedule_type: string;

  @IsString()
  @IsOptional()
  start_date: Date;

  @IsString()
  @IsOptional()
  start_time: string;

  @IsString()
  @IsOptional()
  end_date: Date;

  @IsString()
  @IsOptional()
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
  @ValidateNested()
  @Type(() => SpecificationDto)
  specification: SpecificationDto;

  @IsOptional()
  entry_passes: EntryPass[];
}
