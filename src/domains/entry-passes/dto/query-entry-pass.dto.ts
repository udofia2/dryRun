import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  isNumber,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";
import { ENTRYPASSTYPE, STOCKTYPE } from "@prisma/client";

export class QueryEntryPassDto {
  @ApiProperty({
    description: "Filter by entry pass type",
    example: "invite_only",
    required: false
  })
  @IsEnum(ENTRYPASSTYPE)
  @IsOptional()
  type?: ENTRYPASSTYPE;

  @ApiProperty({
    description: "Filter by stock type",
    example: "unlimited",
    required: false
  })
  @IsEnum(STOCKTYPE)
  @IsOptional()
  stock_type?: STOCKTYPE;

  @ApiProperty({
    description: "Filter by event ID",
    example: "12345-67890-abcdef",
    required: false
  })
  @IsString()
  @IsOptional()
  event_id?: string;

  @ApiProperty({
    description: "Filter by attendee name",
    example: "John Doe",
    required: false
  })
  @IsString()
  @IsOptional()
  attendee_name?: string;

  @ApiProperty({
    description: "Page number for pagination",
    required: false
  })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: "Number of items per page"
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
