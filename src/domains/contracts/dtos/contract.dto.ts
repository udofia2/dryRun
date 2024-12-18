import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SendContractLinkDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
