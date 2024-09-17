import { IsDateString, IsNumber, IsString } from "class-validator";

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
  vendor_name: string;
}
