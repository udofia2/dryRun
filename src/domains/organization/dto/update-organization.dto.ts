import { PartialType } from "@nestjs/mapped-types";
import { CreateOrganizationDto } from "./create-organization.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsDateString
} from "class-validator";

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @ApiPropertyOptional({
    description: "Unique identifier of the organization",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({
    description: "Name of the organization",
    example: "Acme Corporation"
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "ID of the user who owns the organization",
    example: "d1f3f6b8-b2b3-4c2e-9a8e-45f0c1e4eaa4"
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({
    description: "Indicates if the organization is soft-deleted",
    example: false
  })
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @ApiPropertyOptional({
    description: "Timestamp when the organization was deleted",
    example: "2025-06-10T15:00:00.000Z"
  })
  @IsOptional()
  @IsDateString()
  deletedAt?: string;

  @ApiPropertyOptional({
    description: "Timestamp of the last update",
    example: "2025-06-10T15:00:00.000Z"
  })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
