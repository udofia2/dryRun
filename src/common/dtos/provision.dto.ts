import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ProvisionDto {
  @IsNotEmpty()
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

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  vendor_name: string;
}
