import {
  Controller,
  Post,
  Body,
  Patch,
  HttpCode,
  UseGuards,
  Get
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  CreateAuthDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  VerifyOtpDto
} from "./dto";
import { Public } from "./decorator";
import { AuthGuard } from "./guard";
import { GoogleOAuthGuard } from "src/common/guards";
import { CurrentUser } from "src/common/decorators";
import { User } from "@prisma/client";
import { FacebookOAuthGuard } from "src/common/guards/facebook-oauth.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Auth")
@UseGuards(AuthGuard)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(201)
  @Post("signup")
  register(@Body() dto: CreateAuthDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(200)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Get("google")
  @UseGuards(GoogleOAuthGuard)
  googleAuth() {}

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleOAuthGuard)
  googleAuthCallback(@CurrentUser() user: User) {
    return this.authService.socialAuthCallback(user);
  }

  @Public()
  @Get("facebook")
  @UseGuards(FacebookOAuthGuard)
  facebookAuth() {}

  @Public()
  @Get("facebook/redirect")
  @UseGuards(FacebookOAuthGuard)
  facebookAuthCallback(@CurrentUser() user: User) {
    return this.authService.socialAuthCallback(user);
  }

  @Public()
  @Patch("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post("refresh-token")
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Public()
  @Patch("verify-otp")
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Patch("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
