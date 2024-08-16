import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DatabaseService } from "src/database/database.service";
import { User } from "@prisma/client";

@Injectable()
export class ExhibitorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const resourceId = request.params.id;
    const model = this.reflector.get<string>("model", context.getHandler());

    if (!model) {
      return false;
    }

    const resource = await this.db["contract"].findUnique({
      where: { id: resourceId },
      select: { event: true }
    });

    if (!resource) {
      return false;
    }

    return resource.event.exhibitor_id === user.id;
  }
}
