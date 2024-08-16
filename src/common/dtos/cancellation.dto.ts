import { POLICYSPECIFIER, REFUNDPOLICY } from "@prisma/client";
import { IsNumber, IsString } from "class-validator";

export class CancellationDto {
  @IsString()
  refund_policy: REFUNDPOLICY;

  @IsNumber()
  notice_days: number;

  @IsNumber()
  percentage_of_fee: number;

  @IsString()
  specified_by: POLICYSPECIFIER;
}
