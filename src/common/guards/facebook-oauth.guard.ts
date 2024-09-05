import { Logger } from "@nestjs/common";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";

export class FacebookOAuthGuard extends PassportAuthGuard("facebook") {
  private readonly logger = new Logger(FacebookOAuthGuard.name);
}
