import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PaymentScheduleDto {
  @IsNotEmpty()
  @IsString()
  title_of_deliverable: string;

  @IsDateString({ strict: true })
  due_date: Date;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
