import { IsNumber, IsOptional, IsString } from "class-validator";

export class ActivityDto {
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

  @IsString()
  vendor_name: string;
}
