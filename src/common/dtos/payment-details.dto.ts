import { ApiProperty } from "@nestjs/swagger";
import { PAYMENTSTYLETYPE } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PaymentDetailsDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    example: 68000
  })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: "lump_sum"
  })
  payment_style: PAYMENTSTYLETYPE;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: "The premium gathering"
  })
  title_of_deliverable: string;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    type: Date,
    example: "2024-11-25"
  })
  due_date: Date;
}
