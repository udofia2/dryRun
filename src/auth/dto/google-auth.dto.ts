import { ApiProperty } from "@nestjs/swagger";
import { PROVIDER } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SocialAuthDto {
  @IsEnum(PROVIDER, {
    message: `Provider must be one of: ${Object.values(PROVIDER).join(", ")}`
  })
  @IsNotEmpty({ message: "Provider is required" })
  provider: PROVIDER;

  @IsString()
  providerId: string;

  @IsString()
  email: string;

  @IsString()
  password?: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: "+2348012345678",
    required: false,
    description: "User phone number (optional)"
  })
  phone?: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
