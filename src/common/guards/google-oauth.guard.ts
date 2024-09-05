import { Logger } from "@nestjs/common";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";

export class GoogleOAuthGuard extends PassportAuthGuard("google") {
  private readonly logger = new Logger(GoogleOAuthGuard.name);
}
