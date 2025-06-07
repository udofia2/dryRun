import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SocialAuthDto {
  @IsString()
  provider: string;

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
