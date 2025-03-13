import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { ATTENDEEDETAILS } from "./create-entry-pass.dto";

export class AddAttendeesDto {
  @ApiProperty({
    type: [ATTENDEEDETAILS],
    description: "The details of the attendees to be added",
    example: ATTENDEEDETAILS
  })
  @ValidateNested({ each: true })
  @Type(() => ATTENDEEDETAILS)
  @IsArray()
  attendees: ATTENDEEDETAILS[];
}
