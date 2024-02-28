import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext
} from "@nestjs/common";

/**
 * CUSTOM DECORATOR TO GET TOKEN FROM REQUEST
 * @param data
 * @return {User: Express.Query.token | null}
 */
export const TokenExists = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.query.token;

    if (!token) {
      throw new BadRequestException("Please use the link sent to your email!");
    }

    return token;
  }
);
