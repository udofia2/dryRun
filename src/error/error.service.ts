import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { JsonWebTokenError } from "@nestjs/jwt";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { NODE_ENV } from "src/constants";

@Catch(HttpException, Error)
export class ErrorService implements ExceptionFilter {
  logger = new Logger("Exception");
  constructor() {}

  catch(exception: HttpException | unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = "Internal server error!";
    let stackTrace: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;
      stackTrace = exception.stack;
    } else if (exception instanceof JsonWebTokenError) {
      status = 401;
    } else if (exception instanceof PrismaClientValidationError) {
      message = "Invalid Input!";
    }

    if (exception instanceof Error) {
      stackTrace = exception.stack;
    }

    if (NODE_ENV === "development") {
      console.log(exception, stackTrace);
      status = status || 500;
    } else if (NODE_ENV === "production") {
      console.log(exception);
      if (!status) {
        message = "Something went wrong!";
      }
    }

    this.logger.error(
      `${request.method} ${request.url} ${status} - error: ${
        typeof message === "object" ? message.message : message
      }`
    );

    return response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      data: { message: message["message"] || message }
    });
  }
}
