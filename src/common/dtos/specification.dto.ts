import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { ActivityDto } from "./activity.dto";
import { ProvisionDto } from "./provision.dto";

export class SpecificationDto {
  @IsString()
  theme: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityDto)
  activities: ActivityDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProvisionDto)
  provisions: ProvisionDto[];
}
