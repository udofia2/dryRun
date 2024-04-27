import { IsNotEmpty } from "class-validator";
import { Client, Specification, Event } from "src/prospects/dto";

export class CreateOfferDto {
  @IsNotEmpty()
  specification: Specification;

  @IsNotEmpty()
  client: Client;

  @IsNotEmpty()
  event: Event;
}
