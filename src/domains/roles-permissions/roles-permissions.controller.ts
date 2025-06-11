// src/domains/roles-permissions/roles-permissions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody
} from "@nestjs/swagger";
import { RolesPermissionsService } from "./roles-permissions.service";
import { AuthGuard } from "src/auth/guard";
import { CurrentUser } from "src/common/decorators";
import { User } from "@prisma/client";
import {
  CreateSystemRoleDto,
  UpdateSystemRoleDto,
  CreateOrganizationRoleDto,
  UpdateOrganizationRoleDto,
  CreateSystemPermissionDto,
  UpdateSystemPermissionDto,
  InviteCollaboratorDto,
  UpdateCollaboratorDto,
  AssignRoleDto,
  RevokeRoleDto,
  AssignPermissionDto,
  RevokePermissionDto,
  QueryRolesDto,
  QueryPermissionsDto,
  QueryCollaboratorsDto,
  BulkAssignRolesDto,
  BulkAssignPermissionsDto,
  RoleResponseDto,
  PermissionResponseDto,
  CollaboratorResponseDto
} from "./dto/role.dto";

@ApiTags("Roles & Permissions")
@Controller("roles-permissions")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RolesPermissionsController {
  constructor(
    private readonly rolesPermissionsService: RolesPermissionsService
  ) {}

  // ======== SYSTEM ROLES ========
  @Post("system/roles")
  @ApiOperation({
    summary: "Create system role",
    description: "Create a new system-wide role (Platform Admin only)"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "System role created successfully",
    type: RoleResponseDto
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Insufficient permissions"
  })
  async createSystemRole(
    @Body() dto: CreateSystemRoleDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.createSystemRole(dto, user);
  }

  @Patch("system/permissions/:id")
  @ApiOperation({
    summary: "Update system permission",
    description: "Update a system permission (Platform Admin only)"
  })
  @ApiParam({ name: "id", description: "System permission ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "System permission updated successfully",
    type: PermissionResponseDto
  })
  async updateSystemPermission(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSystemPermissionDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.updateSystemPermission(id, dto, user);
  }

  // ======== ORGANIZATION PERMISSIONS ========
  @Post("organization/permissions")
  @ApiOperation({
    summary: "Create organization permission",
    description: "Create a new permission within your organization"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Organization permission created successfully",
    type: PermissionResponseDto
  })
  async createOrganizationPermission(
    @Body() dto: CreateSystemPermissionDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.createOrganizationPermission(dto, user);
  }

  @Get("organization/:orgId/permissions")
  @ApiOperation({
    summary: "Get organization permissions",
    description: "Retrieve all permissions within a specific organization"
  })
  @ApiParam({ name: "orgId", description: "Organization ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Organization permissions retrieved successfully",
    type: [PermissionResponseDto]
  })
  async getOrganizationPermissions(
    @Param("orgId", ParseUUIDPipe) orgId: string,
    @Query() query: QueryPermissionsDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.getOrganizationPermissions(
      orgId,
      query,
      user
    );
  }

  // ======== COLLABORATOR MANAGEMENT ========
  @Post("collaborators/invite")
  @ApiOperation({
    summary: "Invite collaborator",
    description: "Invite a new collaborator to your organization"
  })
  @ApiBody({
    type: InviteCollaboratorDto,
    examples: {
      basic: {
        summary: "Basic invitation",
        description: "Invite collaborator with basic access",
        value: {
          email: "collaborator@example.com",
          name: "John Doe",
          expires_at: "2024-12-31T23:59:59.000Z"
        }
      },
      withRole: {
        summary: "Invitation with role",
        description: "Invite collaborator with a specific role",
        value: {
          email: "manager@example.com",
          name: "Jane Smith",
          role_id: "uuid-role-id",
          expires_at: "2024-12-31T23:59:59.000Z"
        }
      },
      withPermissions: {
        summary: "Invitation with direct permissions",
        description: "Invite collaborator with specific permissions",
        value: {
          email: "specialist@example.com",
          name: "Bob Johnson",
          permission_ids: ["uuid-permission-1", "uuid-permission-2"],
          expires_at: "2024-12-31T23:59:59.000Z"
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Collaborator invited successfully",
    type: CollaboratorResponseDto
  })
  async inviteCollaborator(
    @Body() dto: InviteCollaboratorDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.inviteCollaborator(dto, user);
  }

  @Post("collaborators/:id/accept")
  @ApiOperation({
    summary: "Accept collaboration",
    description: "Accept a collaboration invitation"
  })
  @ApiParam({ name: "id", description: "Collaboration ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Collaboration accepted successfully"
  })
  async acceptCollaboration(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.acceptCollaboration(id, user.id);
  }

  @Get("organization/:orgId/collaborators")
  @ApiOperation({
    summary: "Get organization collaborators",
    description: "Retrieve all collaborators within a specific organization"
  })
  @ApiParam({ name: "orgId", description: "Organization ID" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["pending", "accepted", "rejected"]
  })
  @ApiQuery({ name: "is_active", required: false, type: Boolean })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search by email or name"
  })
  @ApiQuery({
    name: "role_id",
    required: false,
    description: "Filter by role ID"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Collaborators retrieved successfully",
    type: [CollaboratorResponseDto]
  })
  async getCollaborators(
    @Param("orgId", ParseUUIDPipe) orgId: string,
    @Query() query: QueryCollaboratorsDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.getCollaborators(orgId, query, user);
  }

  @Get("collaborators/:id")
  @ApiOperation({
    summary: "Get collaboration by ID",
    description: "Retrieve a specific collaboration"
  })
  @ApiParam({ name: "id", description: "Collaboration ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Collaboration retrieved successfully",
    type: CollaboratorResponseDto
  })
  async getCollaborationById(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesPermissionsService.getCollaborationById(id);
  }

  @Patch("collaborators/:id")
  @ApiOperation({
    summary: "Update collaborator",
    description: "Update a collaborator's role and permissions"
  })
  @ApiParam({ name: "id", description: "Collaboration ID" })
  @ApiBody({
    type: UpdateCollaboratorDto,
    examples: {
      updateRole: {
        summary: "Update role",
        description: "Change collaborator's role",
        value: {
          role_id: "new-role-uuid"
        }
      },
      updatePermissions: {
        summary: "Update permissions",
        description: "Change collaborator's permissions",
        value: {
          permission_ids: ["permission-1-uuid", "permission-2-uuid"]
        }
      },
      deactivate: {
        summary: "Deactivate collaborator",
        description: "Deactivate a collaborator",
        value: {
          is_active: false
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Collaborator updated successfully",
    type: CollaboratorResponseDto
  })
  async updateCollaborator(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollaboratorDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.updateCollaborator(id, dto, user);
  }

  @Delete("collaborators/:id")
  @ApiOperation({
    summary: "Remove collaborator",
    description: "Remove a collaborator from your organization"
  })
  @ApiParam({ name: "id", description: "Collaboration ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Collaborator removed successfully"
  })
  async removeCollaborator(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.removeCollaborator(id, user);
  }

  // ======== ROLE ASSIGNMENTS ========
  @Post("system/roles/assign")
  @ApiOperation({
    summary: "Assign system role",
    description: "Assign a system role to a user (Platform Admin only)"
  })
  @ApiBody({
    type: AssignRoleDto,
    examples: {
      permanent: {
        summary: "Permanent assignment",
        description: "Assign role permanently",
        value: {
          user_id: "user-uuid",
          role_id: "role-uuid"
        }
      },
      temporary: {
        summary: "Temporary assignment",
        description: "Assign role with expiry",
        value: {
          user_id: "user-uuid",
          role_id: "role-uuid",
          expires_at: "2024-12-31T23:59:59.000Z"
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "System role assigned successfully"
  })
  async assignSystemRole(
    @Body() dto: AssignRoleDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.assignSystemRole(dto, user);
  }

  @Post("system/roles/revoke")
  @ApiOperation({
    summary: "Revoke system role",
    description: "Revoke a system role from a user (Platform Admin only)"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "System role revoked successfully"
  })
  async revokeSystemRole(
    @Body() dto: RevokeRoleDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.revokeSystemRole(dto, user);
  }

  // ======== PERMISSION ASSIGNMENTS ========
  @Post("organization/:orgId/permissions/assign")
  @ApiOperation({
    summary: "Assign permission",
    description: "Assign a permission to a user within an organization"
  })
  @ApiParam({ name: "orgId", description: "Organization ID" })
  @ApiBody({
    type: AssignPermissionDto,
    examples: {
      systemPermission: {
        summary: "Assign system permission",
        description: "Assign a system-wide permission",
        value: {
          user_id: "user-uuid",
          permission_id: "system-permission-uuid"
        }
      },
      orgPermission: {
        summary: "Assign organization permission",
        description: "Assign an organization-specific permission",
        value: {
          user_id: "user-uuid",
          org_permission_id: "org-permission-uuid"
        }
      },
      temporaryPermission: {
        summary: "Temporary permission",
        description: "Assign permission with expiry",
        value: {
          user_id: "user-uuid",
          org_permission_id: "org-permission-uuid",
          expires_at: "2024-12-31T23:59:59.000Z"
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Permission assigned successfully"
  })
  async assignPermission(
    @Param("orgId", ParseUUIDPipe) orgId: string,
    @Body() dto: AssignPermissionDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.assignPermission(dto, orgId, user);
  }

  @Post("organization/:orgId/permissions/revoke")
  @ApiOperation({
    summary: "Revoke permission",
    description: "Revoke a permission from a user within an organization"
  })
  @ApiParam({ name: "orgId", description: "Organization ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Permission revoked successfully"
  })
  async revokePermission(
    @Param("orgId", ParseUUIDPipe) orgId: string,
    @Body() dto: RevokePermissionDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.revokePermission(dto, orgId, user);
  }

  // ======== BULK OPERATIONS ========
  @Post("system/roles/bulk-assign")
  @ApiOperation({
    summary: "Bulk assign system roles",
    description:
      "Assign multiple system roles to multiple users (Platform Admin only)"
  })
  @ApiBody({
    type: BulkAssignRolesDto,
    examples: {
      bulkAssign: {
        summary: "Bulk role assignment",
        description: "Assign roles to multiple users",
        value: {
          user_ids: ["user-1-uuid", "user-2-uuid"],
          role_ids: ["role-1-uuid", "role-2-uuid"],
          expires_at: "2024-12-31T23:59:59.000Z"
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Bulk role assignment completed"
  })
  async bulkAssignRoles(
    @Body() dto: BulkAssignRolesDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.bulkAssignRoles(dto, user);
  }

  @Post("organization/:orgId/permissions/bulk-assign")
  @ApiOperation({
    summary: "Bulk assign permissions",
    description:
      "Assign multiple permissions to multiple users within an organization"
  })
  @ApiParam({ name: "orgId", description: "Organization ID" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Bulk permission assignment completed"
  })
  async bulkAssignPermissions(
    @Param("orgId", ParseUUIDPipe) orgId: string,
    @Body() dto: BulkAssignPermissionsDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.bulkAssignPermissions(dto, orgId, user);
  }

  // ======== USER PERMISSIONS RETRIEVAL ========
  @Get("users/:userId/permissions")
  @ApiOperation({
    summary: "Get user permissions",
    description: "Retrieve all permissions for a specific user"
  })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiQuery({
    name: "orgId",
    required: false,
    description: "Organization context"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User permissions retrieved successfully"
  })
  async getUserPermissions(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query("orgId") orgId?: string
  ) {
    return this.rolesPermissionsService.getUserPermissions(userId, orgId);
  }

  @Get("my-permissions")
  @ApiOperation({
    summary: "Get current user permissions",
    description: "Retrieve all permissions for the current authenticated user"
  })
  @ApiQuery({
    name: "orgId",
    required: false,
    description: "Organization context"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Current user permissions retrieved successfully"
  })
  async getMyPermissions(
    @CurrentUser() user: User,
    @Query("orgId") orgId?: string
  ) {
    return this.rolesPermissionsService.getUserPermissions(user.id, orgId);
  }

  // ======== SETUP ENDPOINTS ========
  @Post("organization/setup")
  @ApiOperation({
    summary: "Setup organization defaults",
    description: "Create default roles and permissions for your organization"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Organization defaults created successfully"
  })
  async setupOrganizationDefaults(@CurrentUser() user: User) {
    const permissions =
      await this.rolesPermissionsService.seedDefaultOrganizationPermissions(
        user.id
      );
    const roles =
      await this.rolesPermissionsService.seedDefaultOrganizationRoles(user.id);

    return {
      message: "Organization defaults created successfully",
      permissions,
      roles
    };
  }

  // ======== PERMISSION CHECKING ENDPOINTS ========
  @Get("check/system/:permission")
  @ApiOperation({
    summary: "Check system permission",
    description: "Check if current user has a specific system permission"
  })
  @ApiParam({ name: "permission", description: "Permission type to check" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Permission check result"
  })
  async checkSystemPermission(
    @Param("permission") permission: string,
    @CurrentUser() user: User
  ) {
    const hasPermission =
      await this.rolesPermissionsService.hasSystemPermission(
        user.id,
        permission as any
      );

    return {
      user_id: user.id,
      permission,
      has_permission: hasPermission
    };
  }

  @Get("check/organization/:orgId/:permission")
  @ApiOperation({
    summary: "Check organization permission",
    description:
      "Check if current user has a specific permission within an organization"
  })
  @ApiParam({ name: "orgId", description: "Organization ID" })
  @ApiParam({ name: "permission", description: "Permission type to check" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Permission check result"
  })
  async checkOrganizationPermission(
    @Param("orgId", ParseUUIDPipe) orgId: string,
    @Param("permission") permission: string,
    @CurrentUser() user: User
  ) {
    const hasPermission =
      await this.rolesPermissionsService.hasOrganizationPermission(
        user.id,
        orgId,
        permission as any
      );

    return {
      user_id: user.id,
      organization_id: orgId,
      permission,
      has_permission: hasPermission
    };
  }

  @Get("system/roles")
  @ApiOperation({
    summary: "Get system roles",
    description: "Retrieve all system roles with optional filtering"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "System roles retrieved successfully",
    type: [RoleResponseDto]
  })
  async getSystemRoles(@Query() query: QueryRolesDto) {
    return this.rolesPermissionsService.getSystemRoles(query);
  }

  @Get("system/roles/:id")
  @ApiOperation({
    summary: "Get system role by ID",
    description:
      "Retrieve a specific system role with its permissions and users"
  })
  @ApiParam({ name: "id", description: "System role ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "System role retrieved successfully",
    type: RoleResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "System role not found"
  })
  async getSystemRoleById(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesPermissionsService.getSystemRoleById(id);
  }

  @Patch("system/roles/:id")
  @ApiOperation({
    summary: "Update system role",
    description: "Update a system role (Platform Admin only)"
  })
  @ApiParam({ name: "id", description: "System role ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "System role updated successfully",
    type: RoleResponseDto
  })
  async updateSystemRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSystemRoleDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.updateSystemRole(id, dto, user);
  }

  @Delete("system/roles/:id")
  @ApiOperation({
    summary: "Delete system role",
    description: "Delete a system role (Platform Admin only)"
  })
  @ApiParam({ name: "id", description: "System role ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "System role deleted successfully"
  })
  async deleteSystemRole(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.deleteSystemRole(id, user);
  }

  // ======== ORGANIZATION ROLES ========
  @Post("organization/roles")
  @ApiOperation({
    summary: "Create organization role",
    description: "Create a new role within your organization"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Organization role created successfully",
    type: RoleResponseDto
  })
  async createOrganizationRole(
    @Body() dto: CreateOrganizationRoleDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.createOrganizationRole(dto, user);
  }

  @Get("organization/:orgId/roles")
  @ApiOperation({
    summary: "Get organization roles",
    description: "Retrieve all roles within a specific organization"
  })
  @ApiParam({ name: "orgId", description: "Organization ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Organization roles retrieved successfully",
    type: [RoleResponseDto]
  })
  async getOrganizationRoles(
    @Param("orgId", ParseUUIDPipe) orgId: string,
    @Query() query: QueryRolesDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.getOrganizationRoles(
      orgId,
      query,
      user
    );
  }

  @Get("organization/roles/:id")
  @ApiOperation({
    summary: "Get organization role by ID",
    description: "Retrieve a specific organization role"
  })
  @ApiParam({ name: "id", description: "Organization role ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Organization role retrieved successfully",
    type: RoleResponseDto
  })
  async getOrganizationRoleById(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesPermissionsService.getOrganizationRoleById(id);
  }

  @Patch("organization/roles/:id")
  @ApiOperation({
    summary: "Update organization role",
    description: "Update an organization role"
  })
  @ApiParam({ name: "id", description: "Organization role ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Organization role updated successfully",
    type: RoleResponseDto
  })
  async updateOrganizationRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationRoleDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.updateOrganizationRole(id, dto, user);
  }

  // ======== SYSTEM PERMISSIONS ========
  @Post("system/permissions")
  @ApiOperation({
    summary: "Create system permission",
    description: "Create a new system-wide permission (Platform Admin only)"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "System permission created successfully",
    type: PermissionResponseDto
  })
  async createSystemPermission(
    @Body() dto: CreateSystemPermissionDto,
    @CurrentUser() user: User
  ) {
    return this.rolesPermissionsService.createSystemPermission(dto, user);
  }

  @Get("system/permissions")
  @ApiOperation({
    summary: "Get system permissions",
    description: "Retrieve all system permissions with optional filtering"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "System permissions retrieved successfully",
    type: [PermissionResponseDto]
  })
  async getSystemPermissions(@Query() query: QueryPermissionsDto) {
    return this.rolesPermissionsService.getSystemPermissions(query);
  }
}
