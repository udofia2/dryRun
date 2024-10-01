import { Type } from "class-transformer";
import { IsArray, IsNotEmptyObject, ValidateNested } from "class-validator";
import { CreateClientDto } from "src/common/dtos";
import { PaymentDetailsDto } from "src/common/dtos/payment-details.dto";
import { CreateEventDto } from "src/domains/events/dto";

export class CreateInvoiceDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateClientDto)
  client: CreateClientDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateEventDto)
  event: CreateEventDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDetailsDto)
  payment_details: PaymentDetailsDto[];
}

export class CreatePaymentDto {}
