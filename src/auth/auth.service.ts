import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import {
  CreateAuthDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  SocialAuthDto,
  VerifyOtpDto
} from "./dto";
import { DatabaseService } from "src/database/database.service";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  ExhibitType,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET
} from "src/constants";
import * as argon from "argon2";
import { User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { OtpService } from "src/provider/otp/otp.service";
import { UsersService } from "src/users/users.service";
import { AuthResponse } from "src/common/types";
import { Profile as FacebookUserProfile } from "passport-facebook";

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly otpService: OtpService,
    private readonly usersService: UsersService
  ) {}

  /**
   * CREATE USER
   * @param {CreateAuthDto} dto
   * @returns
   */
  async register(dto: CreateAuthDto): Promise<AuthResponse> {
    dto.email = dto.email.toLowerCase();
    // FIND USER
    const userExists = await this.db.user.findUnique({
      where: { email: dto.email }
    });
    if (userExists) {
      throw new ForbiddenException("User already exists. Please login");
    }

    if (dto.type === "vendor" && !ExhibitType.has(dto.exhibit)) {
      throw new ForbiddenException("Invalid exhibit type");
    }

    dto.password = await argon.hash(dto.password);

    // CREATE USER
    const user = await this.db.user.create({
      data: { ...dto }
    });

    delete user.password;
    const tokens = await this.signToken(user);

    return {
      user,
      tokens
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    dto.email = dto.email.toLowerCase();
    // FIND USER
    const user = await this.db.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new ForbiddenException("Invalid email or password!");
    }

    // VERIFY PASSWORD
    const validPassword = await argon.verify(user.password, dto.password);
    if (!validPassword) {
      throw new ForbiddenException("Invalid email or password!");
    }

    delete user.password;
    const tokens = await this.signToken(user);

    return {
      user,
      tokens
    };
  }

  /**
   * This function creates a new user account with the provided facebook profile information.
   *
   * @param {FacebookUserProfile} profile - The facebook profile information.
   * @returns {Promise<User>} - A promise that resolves to the newly created facebook user.
   */
  public async createFacebookUser(profile: FacebookUserProfile): Promise<User> {
    const facebookUser: SocialAuthDto = {
      email: profile.emails[0].value,
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      provider: profile.provider,
      providerId: profile.id,
      avatar: profile.photos[0]?.value
    };
    return await this.usersService.create(facebookUser);
  }

  /**
   * This function creates a new user account with the provided google profile information.
   *
   * @param profile
   * @returns {Promise<User>} - A promise that resolves to the newly created google user.
   */
  public async createGoogleUser(profile: any): Promise<User> {
    const googleUser: SocialAuthDto = {
      email: profile.email,
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      avatar: profile.picture,
      providerId: profile.id,
      provider: "google"
    };
    return await this.usersService.create(googleUser);
  }

  /**
   * Returns user tokens after successful google authentication.
   *
   * @param {User} user - The user to generate tokens for.
   * @returns {Promise<Tokens>} A promise that resolves to the user's tokens.
   */
  public async socialAuthCallback(user: User): Promise<AuthResponse> {
    user = await this.usersService.findByEmail(user.email);
    const tokens = await this.signToken(user);
    return {
      user,
      tokens
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    // VERIFY REFRESH TOKEN
    const payload = await this.jwt.verifyAsync(dto.refresh_token, {
      secret: REFRESH_TOKEN_SECRET
    });

    if (!payload) {
      throw new UnauthorizedException(
        "Invalid or Expired refresh token, Please login"
      );
    }

    delete payload.iat;
    delete payload.exp;

    // SIGN NEW ACCESS TOKEN
    const access_token = await this.signAccessToken(payload);
    // SIGN NEW REFRESH TOKEN
    const refresh_token = await this.signRefreshToken(payload);

    return { access_token, refresh_token };
  }

  private async signToken(
    user: User
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      id: user.id,
      firstname: user.firstname,
      email: user.email,
      city: user.city,
      state: user.state,
      type: user.type
    };

    // SIGN ACCESS TOKEN
    const access_token = await this.signAccessToken(payload);
    // SIGN REFRESH TOKEN
    const refresh_token = await this.signRefreshToken(payload);

    return { access_token, refresh_token };
  }

  /**
   * SIGN ACCESS TOKEN
   * @param payload
   * @returns {Promise<string>} - Access token
   */
  async signAccessToken(payload: any) {
    return await this.jwt.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      secret: ACCESS_TOKEN_SECRET
    });
  }

  /**
   * SIGN REFRESH TOKEN
   * @param payload
   * @returns {Promise<string>} - Refresh token
   */
  async signRefreshToken(payload: any) {
    return await this.jwt.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      secret: REFRESH_TOKEN_SECRET
    });
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<any> {
    email = email.toLowerCase();
    const user = await this.db.user.findUnique({
      where: { email }
    });

    if (!user) throw new ForbiddenException("User not found, Please Sign Up.");

    // SEND EMAIL TO USER
    await this.otpService.sendOtpViaEmail(email);

    return {
      message: `OTP sent to ${email}`
    };
  }

  async verifyOtp({ email, otp }: VerifyOtpDto): Promise<any> {
    email = email.toLowerCase();

    const verificationResult = await this.otpService.verifyOtpSentViaEmail(
      email,
      otp
    );

    if (verificationResult.status !== "success") {
      throw new BadRequestException(verificationResult.message);
    }
    return {
      message: "OTP verified successfully"
    };
  }

  async resetPassword({ email, password }): Promise<any> {
    await this.db.user.update({
      where: { email },
      data: {
        password: await argon.hash(password)
      }
    });

    return {
      message: "Password reset successfully"
    };
  }
}
