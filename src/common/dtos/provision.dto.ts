import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ProvisionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: "DJ"
  })
  provision: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: "Play only dirge"
  })
  description: string;

  @IsDateString({ strict: true })
  @ApiProperty({
    type: Date,
    example: "2024-12-28"
  })
  start_date: Date;

  @IsDateString({ strict: true })
  @ApiProperty({
    type: Date,
    example: "2024-12-28"
  })
  end_date: Date;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    example: 25000
  })
  amount: number;

  @IsString()
  @ApiProperty({
    type: String,
    example: "DJ Zoo"
  })
  vendor_name: string;
}
