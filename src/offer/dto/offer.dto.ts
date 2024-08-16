import { PAYMENTSTRUCTURE } from "@prisma/client";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";
import { CreateClientDto } from "src/common/dtos";
import { Specification, Event } from "src/prospects/dto";

class PaymentStructure {
  @IsNotEmpty()
  @IsString()
  structure: PAYMENTSTRUCTURE;

  @IsOptional()
  @IsBoolean()
  initial_deposit: boolean;

  @IsOptional()
  @IsNumber()
  initial_deposit_amount: number;
}

export class CreateOfferDto {
  @IsNotEmpty()
  payment_structure: PaymentStructure;

  @IsNotEmpty()
  specification: Specification;

  @IsNotEmpty()
  client: CreateClientDto;

  @IsNotEmpty()
  event: Event;
}
