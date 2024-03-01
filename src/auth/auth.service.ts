import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { CreateAuthDto, ForgotPasswordDto, LoginDto } from "./dto";
import { DatabaseService } from "src/database/database.service";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  ExhibitType,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  RESET_TOKEN_EXPIRY
} from "src/constants";
import * as argon from "argon2";
import { User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { OtpService } from "src/provider/otp/otp.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly otpService: OtpService
  ) {}
  async register(dto: CreateAuthDto) {
    dto.email = dto.email.toLowerCase();
    // FIND USER
    const userExists = await this.db.user.findUnique({
      where: { email: dto.email }
    });
    if (userExists) {
      throw new ForbiddenException("User already exists. Please login");
    }

    if (dto.type === "exhibitor" && !ExhibitType.has(dto.exhibit)) {
      throw new ForbiddenException("Invalid exhibit type");
    }

    dto.password = await argon.hash(dto.password);

    // CREATE USER
    const user = await this.db.user.create({
      data: { ...dto }
    });

    delete user.password;
    const token = await this.signToken(user);

    return {
      success: true,
      message: "User created successfully",
      data: {
        ...user,
        ...token
      }
    };
  }

  async login(dto: LoginDto) {
    dto.email = dto.email.toLowerCase();
    // FIND USER
    const user = await this.db.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new ForbiddenException("Invalid email or password");
    }

    // VERIFY PASSWORD
    const validPassword = await argon.verify(user.password, dto.password);
    if (!validPassword) {
      throw new ForbiddenException("Invalid email or password");
    }

    delete user.password;
    const token = await this.signToken(user);

    return {
      success: true,
      message: "User logged in successfully",
      data: {
        ...user,
        ...token
      }
    };
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

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      secret: ACCESS_TOKEN_SECRET
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      secret: REFRESH_TOKEN_SECRET
    });
    return { access_token, refresh_token };
  }

  private async signResetToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      firstname: user.firstname,
      email: user.email,
      city: user.city,
      state: user.state,
      type: user.type
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: RESET_TOKEN_EXPIRY,
      secret: ACCESS_TOKEN_SECRET
    });
    return token;
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<any> {
    email = email.toLowerCase();
    const user = await this.db.user.findUnique({
      where: { email }
    });

    if (!user) throw new ForbiddenException("User not found, Please Sign Up.");

    //TODO: SEND EMAIL TO USER
    await this.otpService.sendOtpViaEmail(email);

    return {
      status: "success",
      message: `OTP sent to ${email}`
    };
  }

  async resetPassword(token: string, { password }): Promise<any> {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: ACCESS_TOKEN_SECRET
      });
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token!");
    }

    await this.db.user.update({
      where: { id: payload.id },
      data: {
        password: await argon.hash(password)
      }
    });

    return {
      status: "success",
      message: "Password reset successfully"
    };
  }
}
