import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";
import { ActivityDto } from "./activity.dto";
import { ProvisionDto } from "./provision.dto";
import { ApiProperty } from "@nestjs/swagger";

export class SpecificationDto {
  @IsString()
  @ApiProperty({
    type: String,
    example: "Coronation",
    description: "The theme of the specification."
  })
  theme: string;

  // @IsOptional()
  @ValidateNested()
  @ApiProperty({
    type: ActivityDto,
    isArray: true,
    description: "A list of activities associated with the specification."
  })
  @Type(() => ActivityDto)
  activities: ActivityDto[];

  // @IsOptional()
  @ValidateNested()
  @ApiProperty({
    type: ProvisionDto,
    isArray: true,
    description: "A list of provisions included in the specification."
  })
  @Type(() => ProvisionDto)
  provisions: ProvisionDto[];
}
