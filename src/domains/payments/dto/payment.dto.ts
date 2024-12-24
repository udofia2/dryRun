import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SendInvoiceLinkDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
