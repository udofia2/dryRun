import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  logger = new Logger("Response");
  constructor() {
    this.use = this.use.bind(this);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, url } = req;
    const requestTime = new Date().getTime();

    res.on("close", () => {
      const { statusCode } = res;
      const responseTime = new Date().getTime();

      if (statusCode === 200 || statusCode === 201) {
        this.logger.log(
          `${method} ${url} ${statusCode} - ${responseTime - requestTime}ms`
        );
      }
    });

    next();
  }
}
