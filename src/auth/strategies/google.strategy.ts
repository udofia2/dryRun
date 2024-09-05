import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { UsersService } from "src/users/users.service";
import { AuthService } from "../auth.service";
import { forwardRef, Inject } from "@nestjs/common";
import { JwtUser } from "src/common/types";
const configService = new ConfigService();

export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.getOrThrow("GOOGLE_CLIENT_ID"),
      clientSecret: configService.getOrThrow("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"]
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) {
    const user =
      (await this.usersService.findByEmail(profile.email)) ||
      (await this.authService.createGoogleUser(profile));
    done(null, { id: user.id, email: user.email } as JwtUser);
  }
}
