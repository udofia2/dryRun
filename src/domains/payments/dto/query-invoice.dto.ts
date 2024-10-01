import { PartialType, PickType } from "@nestjs/mapped-types";
import { UpdateInvoiceDto } from "./update-payment.dto";

export class QueryInvoiceDto extends PartialType(
  PickType(UpdateInvoiceDto, ["status"])
) {}
