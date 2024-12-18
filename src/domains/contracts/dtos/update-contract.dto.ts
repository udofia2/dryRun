import { ApiProperty } from "@nestjs/swagger";
import { STATUSTYPE } from "@prisma/client";
import { IsString } from "class-validator";

export class UpdateContractDto {
  @IsString()
  @ApiProperty()
  status: STATUSTYPE;
}
