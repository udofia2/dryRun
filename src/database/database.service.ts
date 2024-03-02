import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { DATABASE_URL } from "src/constants";

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: "postgresql://postgres:password@localhost:5435/eventdb?schema=public"
        }
      }
    });
  }
}
