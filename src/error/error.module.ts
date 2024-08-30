import { Module } from "@nestjs/common";
import { ErrorService } from "./error.service";

@Module({
  providers: [ErrorService]
})
export class ErrorModule {}
