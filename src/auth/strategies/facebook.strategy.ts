import { forwardRef, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-facebook";
import { UsersService } from "src/users/users.service";
import { AuthService } from "../auth.service";
import { JwtUser } from "src/common/types";
const configService = new ConfigService();

export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.getOrThrow("FACEBOOK_APP_ID"),
      clientSecret: configService.getOrThrow("FACEBOOK_APP_SECRET"),
      callbackURL: configService.getOrThrow("FACEBOOK_CALLBACK_URL"),
      scope: ["email"],
      profileFields: ["id", "emails", "name", "photos"]
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void
  ) {
    const { emails } = profile;
    const user =
      (await this.usersService.findByEmail(emails[0].value)) ||
      (await this.authService.createFacebookUser(profile));
    done(null, { id: user.id, email: user.email } as JwtUser);
  }
}
