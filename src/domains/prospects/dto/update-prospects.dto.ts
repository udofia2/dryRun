import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PROSPECTSTATUSTYPE } from "@prisma/client";

export class UpdateProspectsDto {
  @IsString()
  @ApiProperty()
  status: PROSPECTSTATUSTYPE;
}
