import { EXHIBITTYPE, USERTYPE } from "@prisma/client";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  ValidateIf
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { UserTypeMustBe } from "src/auth/dto";

export class CreateUserDto {
  @ApiProperty({
    description: "User's first name",
    example: "John",
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: "First name must be a string" })
  @IsNotEmpty({ message: "First name is required" })
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  @MaxLength(50, { message: "First name must not exceed 50 characters" })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      "First name can only contain letters, spaces, hyphens, and apostrophes"
  })
  @Transform(({ value }) => value?.trim())
  firstname: string;

  @ApiProperty({
    description: "User's last name",
    example: "Doe",
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: "Last name must be a string" })
  @IsNotEmpty({ message: "Last name is required" })
  @MinLength(2, { message: "Last name must be at least 2 characters long" })
  @MaxLength(50, { message: "Last name must not exceed 50 characters" })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
  })
  @Transform(({ value }) => value?.trim())
  lastname: string;

  @ApiProperty({
    description: "User's email address",
    example: "john.doe@example.com",
    format: "email"
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  @MaxLength(255, { message: "Email must not exceed 255 characters" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: "User's password",
    example: "SecurePass123!",
    minLength: 8,
    maxLength: 128,
    format: "password"
  })
  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(128, { message: "Password must not exceed 128 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
  })
  password: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: "+2348012345678",
    required: false,
    description: "User phone number (optional)"
  })
  phone?: string;

  @ApiProperty({
    description: "Type of user account",
    example: "customer",
    enum: USERTYPE,
    enumName: "USERTYPE"
  })
  @IsEnum(USERTYPE, {
    message: `User type must be one of: ${Object.values(USERTYPE).join(", ")}`
  })
  @IsNotEmpty({ message: "User type is required" })
  type: USERTYPE;

  @ApiPropertyOptional({
    description: "Type of exhibit (required only for vendor users)",
    example: "booth",
    enum: EXHIBITTYPE,
    enumName: "EXHIBITTYPE"
  })
  @ValidateIf((obj) => obj.type === USERTYPE.vendor)
  @IsEnum(EXHIBITTYPE, {
    message: `Exhibit type must be one of: ${Object.values(EXHIBITTYPE).join(", ")}`
  })
  @IsNotEmpty({
    message: "Exhibit type is required for vendor users"
  })
  @UserTypeMustBe("vendor")
  exhibit?: EXHIBITTYPE;
}
