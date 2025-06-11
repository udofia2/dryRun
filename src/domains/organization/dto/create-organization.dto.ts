import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateOrganizationDto {
  @ApiProperty({
    description: "The name of the organization",
    example: "Acme Corp",
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: "Organization name must be a string" })
  @IsNotEmpty({ message: "Organization name is required" })
  @MinLength(2, {
    message: "Organization name must be at least 2 characters long"
  })
  @MaxLength(100, {
    message: "Organization name must not exceed 100 characters"
  })
  @Matches(/^[a-zA-Z0-9\s&',.-]+$/, {
    message:
      "Organization name can only contain letters, numbers, spaces, and basic punctuation"
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: "The ID of the user who owns or creates the organization",
    example: "usr_1234567890abcdef"
  })
  @IsString({ message: "Owner ID must be a string" })
  @IsNotEmpty({ message: "Owner ID is required" })
  ownerId: string;
}
