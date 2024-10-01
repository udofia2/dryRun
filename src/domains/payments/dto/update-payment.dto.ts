import { PartialType } from "@nestjs/swagger";
import { CreatePaymentDto } from "./create-payment.dto";
import { INVOICESTATUS } from "@prisma/client";
import { IsString } from "class-validator";

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}

export class UpdateInvoiceDto {
  @IsString()
  status: INVOICESTATUS;
}
