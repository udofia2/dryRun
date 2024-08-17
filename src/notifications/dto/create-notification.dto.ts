import { IsString } from "class-validator";

export class CreateNotificationDto {
  @IsString()
  feature: string;

  @IsString()
  message: string;

  @IsString()
  user_id: string;
}
