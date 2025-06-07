import { Controller, Get } from "@nestjs/common";
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorService
} from "@nestjs/terminus";
import { PrismaHealthIndicator } from "../database/prisma.health";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private healthIndicatorService: HealthIndicatorService,
    private http: HttpHealthIndicator,
    private db: PrismaHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check if database is reachable
      () => this.db.isHealthy("database"),

      // Check if application has enough memory
      () => this.memory.checkHeap("memory_heap", 250 * 1024 * 1024), // 250MB
      () => this.memory.checkRSS("memory_rss", 512 * 1024 * 1024), // 512MB

      // Check if storage has enough space
      () =>
        this.disk.checkStorage("disk", {
          path: "/",
          thresholdPercent: 0.9 // 90% threshold
        }),

      // Check if external services are reachable (if applicable)
      () => this.http.pingCheck("nestjs-docs", "https://docs.nestjs.com")
    ]);
  }

  // Separate endpoint for liveness checks (lightweight)
  @Get("liveness")
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      // Simple check to verify app is running
      () => {
        const indicator = this.healthIndicatorService.check("app");
        return indicator.up();
      }
    ]);
  }

  // Separate endpoint for readiness checks (comprehensive)
  @Get("readiness")
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      // Check if database is reachable
      () => this.db.isHealthy("database"),

      // Check if storage has enough space
      () =>
        this.disk.checkStorage("disk", {
          path: "/",
          thresholdPercent: 0.9
        })
    ]);
  }
}
