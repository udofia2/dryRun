import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { STATUSTYPE } from "@prisma/client";

export class UpdateOfferDto {
  @IsString()
  @ApiProperty()
  status: STATUSTYPE;
}
