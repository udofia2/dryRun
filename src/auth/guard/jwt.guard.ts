import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorator";
import { ACCESS_TOKEN_SECRET } from "../../constants";

/**
 * AUTH GUARD
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private reflector: Reflector
  ) {}

  /**
   * CHECK USER AUTHENTICATION
   * @param context
   * @returns {Promise<boolean>}
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // RETURN TRUE IF ROUTE IS PUBLIC; NO FURTHER AUTH
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token: string = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Please login to continue");
    }

    const payload = await this.jwt.verifyAsync(token, {
      secret: ACCESS_TOKEN_SECRET
    });

    console.log("JWT Verified User", payload);

    if (!payload) {
      throw new UnauthorizedException("Please login to continue");
    }

    request["user"] = payload;

    return true;
  }

  /**
   * EXTRACT TOKEN FROM HEADER
   * @param request
   * @returns {token: string | undefined}
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
