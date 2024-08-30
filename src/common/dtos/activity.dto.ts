import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class ActivityDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString({ strict: true })
  start_date: Date;

  @IsDateString({ strict: true })
  end_date: Date;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  vendor_name: string;
}
