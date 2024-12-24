import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class CreateClientDto {
  @IsEmail()
  @ApiProperty({
    type: String,
    example: "Odiong@gmail.com"
  })
  email: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: "Individual"
  })
  type: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: "Mrs Abimbola Fajimite, MFR, CON"
  })
  name: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: "08012347800"
  })
  phone_number: string;
}
