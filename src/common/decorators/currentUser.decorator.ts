import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException
} from "@nestjs/common";
import { AUTH_TEXTS } from "src/constants";

export const CurrentUser = createParamDecorator(
  (data: string | null, context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    if (!request.user) {
      throw new NotFoundException(AUTH_TEXTS.USER_NOT_FOUND);
    }
    if (data) {
      return request.user[data];
    }
    return request.user;
  }
);
