import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PaymentScheduleDto {
  @IsNotEmpty()
  @IsString()
  title_of_deliverable: string;

  @IsNotEmpty()
  @IsString()
  due_date: Date;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
