import { Injectable } from "@nestjs/common";
import {
  HealthIndicatorService,
  HealthIndicatorResult
} from "@nestjs/terminus";
import { DatabaseService } from "./database.service";

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly prisma: DatabaseService
  ) {}

  /**
   * Checks if Prisma can execute queries
   *
   * @param key The key which will be used for the result object
   * @returns {Promise<HealthIndicatorResult>} The health indicator result
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      // Execute a simple query to check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      return indicator.up({
        message: "Database is connected"
      });
    } catch (error) {
      return indicator.down({
        message: error.message,
        code: error.code
      });
    }
  }
}
