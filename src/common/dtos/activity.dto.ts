import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsString } from "class-validator";

export class ActivityDto {
  @IsString()
  @ApiProperty({
    type: String,
    example: "The coronation"
  })
  title: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: "Omele Dance"
  })
  description: string;

  @IsDateString({ strict: true })
  @ApiProperty({
    type: String,
    example: "2024-12-28"
  })
  start_date: Date;

  @IsDateString({ strict: true })
  @ApiProperty({
    type: String,
    example: "2024-12-28"
  })
  end_date: Date;

  @IsNumber()
  @ApiProperty({
    type: Number,
    example: 68000
  })
  amount: number;

  @IsString()
  @ApiProperty({
    type: String,
    example: "Kola"
  })
  vendor_name: string;
}
