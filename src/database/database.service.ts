import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { DATABASE_URL } from "src/constants";

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: DATABASE_URL
        }
      }
    });
  }
}
