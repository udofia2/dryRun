// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
//   HttpStatus,
//   Logger
// } from "@nestjs/common";
// import { JsonWebTokenError } from "@nestjs/jwt";
// import { PrismaClientValidationError } from "@prisma/client/runtime/library";
// import { Request, Response } from "express";
// import { NODE_ENV } from "src/constants";

// @Catch(HttpException, Error)
// export class ErrorService implements ExceptionFilter {
//   logger = new Logger("Exception");
//   constructor() {}

//   catch(exception: HttpException | unknown, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();

//     let status = HttpStatus.INTERNAL_SERVER_ERROR;
//     let message: any = "Internal server error!";
//     let stackTrace: string | undefined;

//     if (exception instanceof HttpException) {
//       status = exception.getStatus();
//       message = exception.getResponse() as string;
//       stackTrace = exception.stack;
//     } else if (exception instanceof JsonWebTokenError) {
//       status = 401;
//     } else if (exception instanceof PrismaClientValidationError) {
//       message = "Invalid Input!";
//     }

//     if (exception instanceof Error) {
//       stackTrace = exception.stack;
//     }

//     if (NODE_ENV === "development") {
//       console.log(exception, stackTrace);
//       status = status || 500;
//     } else if (NODE_ENV === "production") {
//       console.log(exception);
//       if (!status) {
//         message = "Something went wrong!";
//       }
//     }

//     this.logger.error(
//       `${request.method} ${request.url} ${status} - error: ${
//         typeof message === "object" ? message.message : message
//       }`
//     );

//     return response.status(status).json({
//       success: false,
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//       data: { message: message["message"] || message }
//     });
//   }
// }

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { Request, Response } from "express";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError
} from "@prisma/client/runtime/library";

import { Prisma } from "@prisma/client";
@Catch()
export class ErrorService implements ExceptionFilter {
  private readonly logger = new Logger(ErrorService.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string | string[];
    let error: string;

    // Handle Prisma errors first
    if (this.isPrismaError(exception)) {
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      error = prismaError.error;
    }
    // Handle NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    }
    // Handle unexpected errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
      error = "InternalServerError";

      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : "No stack trace"
      );
    }

    // Log the error with context
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : "No stack trace"
    );

    // Send formatted error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error
    });
  }

  private isPrismaError(
    exception: unknown
  ): exception is
    | PrismaClientKnownRequestError
    | PrismaClientValidationError
    | PrismaClientInitializationError
    | PrismaClientRustPanicError {
    return (
      exception instanceof PrismaClientKnownRequestError ||
      exception instanceof PrismaClientValidationError ||
      exception instanceof PrismaClientInitializationError ||
      exception instanceof PrismaClientRustPanicError
    );
  }

  private handlePrismaError(
    exception:
      | PrismaClientKnownRequestError
      | PrismaClientValidationError
      | PrismaClientInitializationError
      | PrismaClientRustPanicError
  ): {
    status: HttpStatus;
    message: string;
    error: string;
  } {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handleKnownRequestError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.error("Prisma validation error", exception.stack);
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Invalid data format provided",
        error: "ValidationError"
      };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error("Prisma initialization error", exception.stack);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Database connection failed",
        error: "DatabaseConnectionError"
      };
    }

    if (exception instanceof Prisma.PrismaClientRustPanicError) {
      this.logger.error("Prisma runtime error", exception.stack);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Database runtime error occurred",
        error: "DatabaseRuntimeError"
      };
    }

    // Fallback for unknown Prisma errors
    this.logger.error("Unknown Prisma error", (exception as Error).stack);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Database operation failed",
      error: "DatabaseError"
    };
  }

  private handleKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError
  ): {
    status: HttpStatus;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case "P2002":
        // Unique constraint violation
        const target = exception.meta?.target as string[] | undefined;
        const field = target ? target[0] : "field";
        this.logger.error(
          `Unique constraint violation on ${field}`,
          exception.stack
        );
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${field} already exists`,
          error: "ConflictError"
        };

      case "P2003":
        // Foreign key constraint violation
        this.logger.error("Foreign key constraint violation", exception.stack);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid reference data provided",
          error: "ForeignKeyError"
        };

      case "P2006":
        // Invalid value for field
        this.logger.error("Invalid field value", exception.stack);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid data provided",
          error: "InvalidDataError"
        };

      case "P2011":
        // Null constraint violation
        const nullField = exception.meta?.constraint as string | undefined;
        this.logger.error(
          `Null constraint violation on ${nullField}`,
          exception.stack
        );
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Required field '${nullField || "field"}' is missing`,
          error: "MissingFieldError"
        };

      case "P2014":
        // Relation violation
        this.logger.error("Relation constraint violation", exception.stack);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid relationship data provided",
          error: "RelationError"
        };

      case "P2025":
        // Record not found
        this.logger.error("Record not found", exception.stack);
        return {
          status: HttpStatus.NOT_FOUND,
          message: "Record not found",
          error: "NotFoundError"
        };

      case "P2016":
        // Query interpretation error
        this.logger.error("Query interpretation error", exception.stack);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid query parameters",
          error: "QueryError"
        };

      case "P2021":
        // Table does not exist
        this.logger.error("Table does not exist", exception.stack);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Database schema error",
          error: "SchemaError"
        };

      default:
        this.logger.error(
          `Unknown Prisma error code: ${exception.code}`,
          exception.stack
        );
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Database operation failed",
          error: "DatabaseError"
        };
    }
  }
}
