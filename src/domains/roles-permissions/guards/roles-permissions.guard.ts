import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesPermissionsService } from "../roles-permissions.service";
import { PERMISSION_TYPE } from "@prisma/client";

export const RequireSystemPermission = (permission: PERMISSION_TYPE) =>
  SetMetadata("systemPermission", permission);

export const RequireOrganizationPermission = (permission: PERMISSION_TYPE) =>
  SetMetadata("orgPermission", permission);

export const RequireAnyPermission = (permissions: PERMISSION_TYPE[]) =>
  SetMetadata("anyPermission", permissions);

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesPermissionsService: RolesPermissionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check for system permission requirement
    const systemPermission = this.reflector.get(
      "systemPermission",
      context.getHandler()
    );
    if (systemPermission) {
      const hasPermission =
        await this.rolesPermissionsService.hasSystemPermission(
          user.id,
          systemPermission
        );
      if (!hasPermission) {
        throw new ForbiddenException(
          `System permission required: ${systemPermission}`
        );
      }
    }

    // Check for organization permission requirement
    const orgPermission = this.reflector.get(
      "orgPermission",
      context.getHandler()
    );
    if (orgPermission) {
      const organizationId =
        request.params.orgId || request.params.organizationId || user.id;
      const hasPermission =
        await this.rolesPermissionsService.hasOrganizationPermission(
          user.id,
          organizationId,
          orgPermission
        );
      if (!hasPermission) {
        throw new ForbiddenException(
          `Organization permission required: ${orgPermission}`
        );
      }
    }

    // Check for any of multiple permissions
    const anyPermissions = this.reflector.get(
      "anyPermission",
      context.getHandler()
    );
    if (anyPermissions && anyPermissions.length > 0) {
      const organizationId =
        request.params.orgId || request.params.organizationId || user.id;
      const hasAnyPermission = await Promise.all(
        anyPermissions.map((permission) =>
          this.rolesPermissionsService
            .hasSystemPermission(user.id, permission)
            .then(
              (hasSystem) =>
                hasSystem ||
                this.rolesPermissionsService.hasOrganizationPermission(
                  user.id,
                  organizationId,
                  permission
                )
            )
        )
      );

      if (!hasAnyPermission.some(Boolean)) {
        throw new ForbiddenException(
          `One of these permissions required: ${anyPermissions.join(", ")}`
        );
      }
    }

    return true;
  }
}
