import { IsString, IsNumber, IsObject } from 'class-validator';

export class PaystackWebhookDto {
  @IsString()
  event: string;

  @IsObject()
  data: {
    reference: string;
    status: string;
    amount: number;
    metadata: {
      entry_pass_id: string;
      user_id: string;
      quantity: number;
    };
  };
}
