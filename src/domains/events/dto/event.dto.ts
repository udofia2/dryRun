import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SendEventLinkDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
