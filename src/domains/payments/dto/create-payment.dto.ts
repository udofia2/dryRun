import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmptyObject, ValidateNested } from "class-validator";
import { CreateClientDto, SpecificationDto } from "src/common/dtos";
import { PaymentDetailsDto } from "src/common/dtos/payment-details.dto";
// import { CreateEventDto } from "src/domains/events/dto";

export class CreateInvoiceDto {
  @ApiProperty()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateClientDto)
  client: CreateClientDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @ApiProperty()
  @Type(() => SpecificationDto)
  specification: SpecificationDto;

  // @IsNotEmptyObject()
  // @ValidateNested()
  // @Type(() => CreateEventDto)
  // event: CreateEventDto;

  @ValidateNested({ each: true })
  @ApiProperty({ type: PaymentDetailsDto })
  @Type(() => PaymentDetailsDto)
  payment_details: PaymentDetailsDto;
}

export class CreatePaymentDto {}
