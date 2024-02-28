import { Controller, Post, Body, Patch, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  CreateAuthDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto
} from "./dto/auth.dto";
import { Public, TokenExists } from "./decorator";

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
  @Patch("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Patch("reset-password")
  resetPassword(
    @Body() dto: ResetPasswordDto,
    @TokenExists("token") token: string
  ) {
    return this.authService.resetPassword(token, dto);
  }
}
