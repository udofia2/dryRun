import { EXHIBITTYPE, USERTYPE } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { UserTypeMustBe } from "src/auth/dto";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  type: USERTYPE;

  @UserTypeMustBe("vendor")
  exhibit: EXHIBITTYPE;
}
