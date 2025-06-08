import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  SYSTEM_ROLE_TYPE,
  ORG_ROLE_TYPE,
  PERMISSION_TYPE
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEmail,
  IsDateString
} from "class-validator";

// ======== SYSTEM ROLES ========
export class CreateSystemRoleDto {
  @ApiProperty({
    description: "System role name",
    example: "Platform Admin"
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "System role type",
    enum: SYSTEM_ROLE_TYPE,
    example: "admin"
  })
  @IsEnum(SYSTEM_ROLE_TYPE)
  type: SYSTEM_ROLE_TYPE;

  @ApiPropertyOptional({
    description: "Role description",
    example: "Full platform administration access"
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Permission IDs to assign to this role",
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  permission_ids?: string[];
}

export class UpdateSystemRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  permission_ids?: string[];
}

// ======== ORGANIZATION ROLES ========
export class CreateOrganizationRoleDto {
  @ApiProperty({
    description: "Organization role name",
    example: "Event Manager"
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Organization role type",
    enum: ORG_ROLE_TYPE,
    example: "manager"
  })
  @IsEnum(ORG_ROLE_TYPE)
  type: ORG_ROLE_TYPE;

  @ApiPropertyOptional({
    description: "Role description",
    example: "Manages events and collaborators"
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Permission IDs to assign to this role",
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  permission_ids?: string[];
}

export class UpdateOrganizationRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  permission_ids?: string[];
}

// ======== PERMISSIONS ========
export class CreateSystemPermissionDto {
  @ApiProperty({
    description: "Permission name",
    example: "Event Management"
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Permission type",
    enum: PERMISSION_TYPE,
    example: "event_create"
  })
  @IsEnum(PERMISSION_TYPE)
  type: PERMISSION_TYPE;

  @ApiPropertyOptional({
    description: "Permission description",
    example: "Allows creating new events"
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Resource this permission applies to",
    example: "events"
  })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({
    description: "Action this permission allows",
    example: "create"
  })
  @IsOptional()
  @IsString()
  action?: string;
}

export class UpdateSystemPermissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// ======== COLLABORATOR MANAGEMENT ========
export class InviteCollaboratorDto {
  @ApiProperty({
    description: "Collaborator email",
    example: "collaborator@example.com"
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Collaborator name",
    example: "John Doe"
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: "Organization role ID to assign",
    example: "uuid-role-id"
  })
  @IsOptional()
  @IsUUID("4")
  role_id?: string;

  @ApiPropertyOptional({
    description: "Permission IDs to assign directly",
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  permission_ids?: string[];

  @ApiPropertyOptional({
    description: "Invitation expiry date",
    example: "2024-12-31T23:59:59.000Z"
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class UpdateCollaboratorDto {
  @ApiPropertyOptional({
    description: "New role ID for the collaborator"
  })
  @IsOptional()
  @IsUUID("4")
  role_id?: string;

  @ApiPropertyOptional({
    description: "Permission IDs to assign/revoke",
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  permission_ids?: string[];

  @ApiPropertyOptional({
    description: "Whether the collaboration is active"
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// ======== ROLE ASSIGNMENT ========
export class AssignRoleDto {
  @ApiProperty({
    description: "User ID to assign role to",
    example: "uuid-user-id"
  })
  @IsUUID("4")
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: "Role ID to assign",
    example: "uuid-role-id"
  })
  @IsUUID("4")
  @IsNotEmpty()
  role_id: string;

  @ApiPropertyOptional({
    description: "Role assignment expiry date",
    example: "2024-12-31T23:59:59.000Z"
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class RevokeRoleDto {
  @ApiProperty({
    description: "User ID to revoke role from",
    example: "uuid-user-id"
  })
  @IsUUID("4")
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: "Role ID to revoke",
    example: "uuid-role-id"
  })
  @IsUUID("4")
  @IsNotEmpty()
  role_id: string;
}

// ======== PERMISSION ASSIGNMENT ========
export class AssignPermissionDto {
  @ApiProperty({
    description: "User ID to assign permission to",
    example: "uuid-user-id"
  })
  @IsUUID("4")
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({
    description: "System permission ID to assign",
    example: "uuid-permission-id"
  })
  @IsOptional()
  @IsUUID("4")
  permission_id?: string;

  @ApiPropertyOptional({
    description: "Organization permission ID to assign",
    example: "uuid-org-permission-id"
  })
  @IsOptional()
  @IsUUID("4")
  org_permission_id?: string;

  @ApiPropertyOptional({
    description: "Permission assignment expiry date",
    example: "2024-12-31T23:59:59.000Z"
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class RevokePermissionDto {
  @ApiProperty({
    description: "User ID to revoke permission from",
    example: "uuid-user-id"
  })
  @IsUUID("4")
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({
    description: "System permission ID to revoke",
    example: "uuid-permission-id"
  })
  @IsOptional()
  @IsUUID("4")
  permission_id?: string;

  @ApiPropertyOptional({
    description: "Organization permission ID to revoke",
    example: "uuid-org-permission-id"
  })
  @IsOptional()
  @IsUUID("4")
  org_permission_id?: string;
}

// ======== BULK OPERATIONS ========
export class BulkAssignRolesDto {
  @ApiProperty({
    description: "User IDs to assign roles to",
    type: [String]
  })
  @IsArray()
  @IsUUID("4", { each: true })
  user_ids: string[];

  @ApiProperty({
    description: "Role IDs to assign",
    type: [String]
  })
  @IsArray()
  @IsUUID("4", { each: true })
  role_ids: string[];

  @ApiPropertyOptional({
    description: "Role assignment expiry date",
    example: "2024-12-31T23:59:59.000Z"
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class BulkAssignPermissionsDto {
  @ApiProperty({
    description: "User IDs to assign permissions to",
    type: [String]
  })
  @IsArray()
  @IsUUID("4", { each: true })
  user_ids: string[];

  @ApiProperty({
    description: "Permission IDs to assign",
    type: [String]
  })
  @IsArray()
  @IsUUID("4", { each: true })
  permission_ids: string[];

  @ApiPropertyOptional({
    description: "Permission assignment expiry date",
    example: "2024-12-31T23:59:59.000Z"
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

// ======== QUERY DTOS ========
export class QueryRolesDto {
  @ApiPropertyOptional({
    description: "Filter by role type",
    enum: [...Object.values(SYSTEM_ROLE_TYPE), ...Object.values(ORG_ROLE_TYPE)]
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "Filter by active status"
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: "Search by name"
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class QueryPermissionsDto {
  @ApiPropertyOptional({
    description: "Filter by permission type",
    enum: PERMISSION_TYPE
  })
  @IsOptional()
  @IsEnum(PERMISSION_TYPE)
  type?: PERMISSION_TYPE;

  @ApiPropertyOptional({
    description: "Filter by resource"
  })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({
    description: "Filter by active status"
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: "Search by name"
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class QueryCollaboratorsDto {
  @ApiPropertyOptional({
    description: "Filter by collaboration status",
    enum: ["pending", "accepted", "rejected"]
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Filter by active status"
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: "Search by email or name"
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by role ID"
  })
  @IsOptional()
  @IsUUID("4")
  role_id?: string;
}

// ======== RESPONSE DTOS ========
export class PermissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: PERMISSION_TYPE;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  resource?: string;

  @ApiProperty()
  action?: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class RoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  permissions?: PermissionResponseDto[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class CollaboratorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  invited_at: Date;

  @ApiProperty()
  accepted_at?: Date;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  collaborator: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };

  @ApiProperty()
  roles?: RoleResponseDto[];

  @ApiProperty()
  permissions?: PermissionResponseDto[];
}
