import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException
} from "@nestjs/common";
import { JsonWebTokenError } from "@nestjs/jwt";
import { Request, Response } from "express";
import { NODE_ENV } from "src/constants";

@Catch(HttpException, Error)
export class ErrorService implements ExceptionFilter {
  constructor() {}

  catch(exception: HttpException | unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number | undefined;
    let message = "Internal server error";
    let stackTrace: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;
      stackTrace = exception.stack;
    } else if (exception instanceof JsonWebTokenError) {
      status = 401;
    }

    if (exception instanceof Error) {
      message = exception.message;
      stackTrace = exception.stack;
    }

    if (NODE_ENV === "development") {
      console.log(exception);
      status = status || 500;
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
        stackTrace
      });
    } else if (NODE_ENV === "production") {
      message = "Something went wrong!";
      response.status(status).json({
        statusCode: status,
        message
      });
    }
  }
}
