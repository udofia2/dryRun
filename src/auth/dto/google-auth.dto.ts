import { IsOptional, IsString } from "class-validator";

export class SocialAuthDto {
  @IsString()
  provider: string;

  @IsString()
  providerId: string;

  @IsString()
  email: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
