import { UpdateContractDto } from "./update-contract.dto";
import { PartialType, PickType } from "@nestjs/mapped-types";

export class QueryContractDto extends PartialType(
  PickType(UpdateContractDto, ["status"])
) {}
