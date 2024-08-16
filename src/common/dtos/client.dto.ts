import { IsEmail, IsString } from "class-validator";

export class CreateClientDto {
  @IsEmail()
  email: string;

  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  phone_number: string;
}
