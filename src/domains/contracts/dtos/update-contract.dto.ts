import { STATUSTYPE } from "@prisma/client";
import { IsString } from "class-validator";

export class UpdateContractDto {
  @IsString()
  status: STATUSTYPE;
}
