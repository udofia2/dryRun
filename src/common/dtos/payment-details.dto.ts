import { PAYMENTSTYLETYPE } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PaymentDetailsDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  payment_style: PAYMENTSTYLETYPE;

  @IsNotEmpty()
  @IsString()
  title_of_deliverable: string;

  @Type(() => Date)
  @IsDate()
  due_date: Date;
}
