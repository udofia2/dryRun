import { Type } from "class-transformer";
import { IsNotEmptyObject, ValidateNested } from "class-validator";
import {
  CancellationDto,
  CreateClientDto,
  PaymentScheduleDto
} from "src/common/dtos";
import { CreateEventDto } from "src/events/dto";

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

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => PaymentScheduleDto)
  payment_structure: PaymentScheduleDto;
}
