import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ProvisionDto {
  @IsNotEmpty()
  @IsString()
  provision: string;

  @IsString()
  description: string;

  @IsDateString({ strict: true })
  start_date: Date;

  @IsDateString({ strict: true })
  end_date: Date;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  vendor_name: string;
}
