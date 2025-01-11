import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsArray } from "class-validator";

export class InviteDto {
  @ApiProperty({
    description: "Sender email",
    example: "john.doe@example.com"
  })
  @IsString()
  sender_email: string;

  @ApiProperty({
    description: "Sender name",
    example: "John Doe"
  })
  @IsString()
  sender_name: string;

  @ApiProperty({
    description: "Recipients emails",
    example: ["jane.doe@example.com", "bob.smith@example.com"]
  })
  @IsArray()
  @IsString({ each: true })
  recipients_emails: string[];

  @ApiProperty({
    description: "Subject",
    example: "Invitation to the event"
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: "Message",
    example: "You are invited to attend the event."
  })
  @IsString()
  message: string;
}
