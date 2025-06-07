import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientOptions } from "@prisma/client/runtime/library";
import { DATABASE_URL } from "src/constants";

@Injectable()
export class DatabaseService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    "query" | "info" | "warn" | "error"
  >
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>("DATABASE_URL")
        }
      },
      log:
        configService.get<string>("NODE_ENV") === "development"
          ? [
              { emit: "event", level: "query" },
              { emit: "event", level: "info" },
              { emit: "event", level: "warn" },
              { emit: "event", level: "error" }
            ]
          : [{ emit: "event", level: "info" }]
    });

    this.$on("query", (e: Prisma.QueryEvent) => {
      if (configService.get("NODE_ENV") === "development") {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}`);
      }
    });

    this.$on("info", (e: Prisma.LogEvent) => {
      this.logger.log(e.message);
    });
    this.$on("warn", (e: Prisma.LogEvent) => {
      this.logger.warn(e.message);
    });
    this.$on("error", (e: Prisma.LogEvent) => {
      this.logger.error(e.message);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Database connection established successfully");
    } catch (error) {
      this.logger.error("Failed to connect to database:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log("Database connection closed successfully");
    } catch (error) {
      this.logger.error("Error while disconnecting from database:", error);
      // throw error
    }
  }
  /**
   * Executes a database transaction with improved error handling and retry logic
   *
   * @param fn Function containing transaction operations
   * @param options Transaction options
   * @returns Result of the transaction
   */
  async executeTransaction<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxAttempts?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
      timeout?: number;
    }
  ): Promise<T> {
    const {
      maxAttempts = 3,
      isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted,
      timeout = 5000
    } = options ?? {};

    let attempts = 0;
    let lastError: Error;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const result = await this.$transaction(fn, {
          isolationLevel,
          timeout
        });

        return result;
      } catch (error) {
        lastError = error;

        // Determine if the error is transient and can be retried
        const isTransientError =
          error.code === "P1000" || // Authentication failed
          error.code === "P1001" || // Can't reach database server
          error.code === "P1008" || // Operations timed out
          error.code === "P1017" || // Server closed the connection
          error.code === "P2034"; // Transaction failed due to a serialization error

        if (!isTransientError || attempts >= maxAttempts) {
          this.logger.error(`Transaction failed after ${attempts} attempts`, {
            error: error.message,
            code: error.code,
            stack: error.stack
          });
          throw error;
        }

        this.logger.warn(
          `Transaction attempt ${attempts} failed, retrying...`,
          {
            error: error.message,
            code: error.code
          }
        );

        // Add exponential backoff before retrying
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.min(100 * Math.pow(2, attempts), 1000) // Cap at 1 second
          )
        );

        throw lastError;
      }
    }
  }

  /**
   * Health check method to verify database connectivity
   *
   * @returns Object with database status information
   */
  async healthCheck(): Promise<{
    status: string;
    version: string;
    uptime: number;
  }> {
    try {
      // Execute a simple query to check database connectivity
      const result = await this.$queryRaw<{ version: string; now: Date }[]>`
        SELECT version() as version, now() as now;
      `;

      if (result && result.length > 0) {
        return {
          status: "up",
          version: result[0].version,
          uptime: process.uptime()
        };
      }

      return {
        status: "unknown",
        version: "unknown",
        uptime: process.uptime()
      };
    } catch (error) {
      this.logger.error("Database health check failed:", error);
      return {
        status: "down",
        version: "unknown",
        uptime: process.uptime()
      };
    }
  }

  // async onConnect() {
  //   Logger.log("Database connected successfully");
  // }
}
