import { Type } from "class-transformer";
import { IsArray, IsNotEmptyObject, ValidateNested } from "class-validator";
import { CancellationDto, CreateClientDto } from "src/common/dtos";
import { PaymentDetailsDto } from "src/common/dtos/payment-details.dto";
import { CreateEventDto } from "src/domains/events/dto";

export class CreateContractDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateClientDto)
  client: CreateClientDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateEventDto)
  event: CreateEventDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CancellationDto)
  cancellation_policy: CancellationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDetailsDto)
  payment_details: PaymentDetailsDto[];
}
