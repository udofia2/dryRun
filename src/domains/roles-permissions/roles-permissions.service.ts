// src/domains/roles-permissions/roles-permissions.service.ts
import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { User, PERMISSION_TYPE, SYSTEM_ROLE_TYPE, ORG_ROLE_TYPE } from "@prisma/client";
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
  BulkAssignPermissionsDto
} from "./dto/role.dto";
import { EmailService } from "src/provider/email/email.service";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { NotificationFeature } from "src/domains/notifications/dto/create-notification.dto";
import { NOTIFICATIONTYPE } from "src/domains/notifications/dto/send-notification.dto";

@Injectable()
export class RolesPermissionsService {
  private readonly logger = new Logger(RolesPermissionsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationsService
  ) {}

  // ======== PERMISSION CHECKING UTILITIES ========
  async hasSystemPermission(
    userId: string,
    permissionType: PERMISSION_TYPE
  ): Promise<boolean> {
    try {
      const userPermissions = await this.db.userSystemRole.findMany({
        where: {
          user_id: userId,
          is_active: true,
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } }
          ]
        },
        include: {
          system_role: {
            include: {
              permissions: {
                include: {
                  system_permission: true
                }
              }
            }
          }
        }
      });

      return userPermissions.some(userRole =>
        userRole.system_role.permissions.some(rolePermission =>
          rolePermission.system_permission.type === permissionType &&
          rolePermission.system_permission.is_active
        )
      );
    } catch (error) {
      this.logger.error(`Error checking system permission for user ${userId}:`, error);
      return false;
    }
  }

  async hasOrganizationPermission(
    userId: string,
    organizationId: string,
    permissionType: PERMISSION_TYPE
  ): Promise<boolean> {
    try {
      // Check if user is organization owner
      const organization = await this.db.user.findUnique({
        where: { id: organizationId }
      });

      if (organization && organization.id === userId) {
        return true; // Organization owner has all permissions
      }

      // Check collaboration-based permissions
      const collaboration = await this.db.collaboration.findUnique({
        where: {
          collaborator_id_organization_id: {
            collaborator_id: userId,
            organization_id: organizationId
          }
        },
        include: {
          roles: {
            include: {
              org_role: {
                include: {
                  permissions: {
                    include: {
                      org_permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!collaboration || !collaboration.is_active) {
        return false;
      }

      return collaboration.roles.some(userRole =>
        userRole.org_role.permissions.some(rolePermission =>
          rolePermission.org_permission.type === permissionType &&
          rolePermission.org_permission.is_active
        )
      );
    } catch (error) {
      this.logger.error(`Error checking organization permission for user ${userId}:`, error);
      return false;
    }
  }

  async requireSystemPermission(
    userId: string,
    permissionType: PERMISSION_TYPE
  ): Promise<void> {
    const hasPermission = await this.hasSystemPermission(userId, permissionType);
    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${permissionType}`
      );
    }
  }

  async requireOrganizationPermission(
    userId: string,
    organizationId: string,
    permissionType: PERMISSION_TYPE
  ): Promise<void> {
    const hasPermission = await this.hasOrganizationPermission(
      userId,
      organizationId,
      permissionType
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions for organization. Required: ${permissionType}`
      );
    }
  }

  // ======== SYSTEM ROLES MANAGEMENT ========
  async createSystemRole(dto: CreateSystemRoleDto, user: User) {
    await this.requireSystemPermission(user.id, PERMISSION_TYPE.permission_grant);

    return this.db.$transaction(async (tx) => {
      const role = await tx.systemRole.create({
        data: {
          name: dto.name,
          type: dto.type,
          description: dto.description
        }
      });

      if (dto.permission_ids && dto.permission_ids.length > 0) {
        await tx.systemRolePermission.createMany({
          data: dto.permission_ids.map(permissionId => ({
            system_role_id: role.id,
            system_permission_id: permissionId
          }))
        });
      }

      this.logger.log(`System role created: ${role.name} by user ${user.id}`);
      return this.getSystemRoleById(role.id);
    });
  }

  async updateSystemRole(id: string, dto: UpdateSystemRoleDto, user: User) {
    await this.requireSystemPermission(user.id, PERMISSION_TYPE.permission_grant);

    return this.db.$transaction(async (tx) => {
      const role = await tx.systemRole.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          is_active: dto.is_active
        }
      });

      if (dto.permission_ids) {
        // Remove existing permissions
        await tx.systemRolePermission.deleteMany({
          where: { system_role_id: id }
        });

        // Add new permissions
        if (dto.permission_ids.length > 0) {
          await tx.systemRolePermission.createMany({
            data: dto.permission_ids.map(permissionId => ({
              system_role_id: id,
              system_permission_id: permissionId
            }))
          });
        }
      }

      this.logger.log(`System role updated: ${role.name} by user ${user.id}`);
      return this.getSystemRoleById(id);
    });
  }

  async getSystemRoles(query: QueryRolesDto) {
    const where: any = {};

    if (query.type && Object.values(SYSTEM_ROLE_TYPE).includes(query.type as SYSTEM_ROLE_TYPE)) {
      where.type = query.type;
    }

    if (query.is_active !== undefined) {
      where.is_active = query.is_active;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    return this.db.systemRole.findMany({
      where,
      include: {
        permissions: {
          include: {
            system_permission: true
          }
        },
        _count: {
          select: { user_roles: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getSystemRoleById(id: string) {
    const role = await this.db.systemRole.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            system_permission: true
          }
        },
        user_roles: {
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      throw new NotFoundException('System role not found');
    }

    return role;
  }

  async deleteSystemRole(id: string, user: User) {
    await this.requireSystemPermission(user.id, PERMISSION_TYPE.permission_grant);

    const role = await this.db.systemRole.findUnique({
      where: { id },
      include: { _count: { select: { user_roles: true } } }
    });

    if (!role) {
      throw new NotFoundException('System role not found');
    }

    if (role._count.user_roles > 0) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to users. Remove all users first.'
      );
    }

    await this.db.systemRole.delete({ where: { id } });
    this.logger.log(`System role deleted: ${role.name} by user ${user.id}`);

    return { message: 'System role deleted successfully' };
  }

  // ======== ORGANIZATION ROLES MANAGEMENT ========
  async createOrganizationRole(dto: CreateOrganizationRoleDto, user: User) {
    await this.requireOrganizationPermission(user.id, user.id, PERMISSION_TYPE.role_assign);

    return this.db.$transaction(async (tx) => {
      const role = await tx.organizationRole.create({
        data: {
          name: dto.name,
          type: dto.type,
          description: dto.description,
          organization_id: user.id
        }
      });

      if (dto.permission_ids && dto.permission_ids.length > 0) {
        await tx.organizationRolePermission.createMany({
          data: dto.permission_ids.map(permissionId => ({
            org_role_id: role.id,
            org_permission_id: permissionId
          }))
        });
      }

      this.logger.log(`Organization role created: ${role.name} by user ${user.id}`);
      return this.getOrganizationRoleById(role.id);
    });
  }

  async updateOrganizationRole(id: string, dto: UpdateOrganizationRoleDto, user: User) {
    const role = await this.db.organizationRole.findUnique({
      where: { id }
    });

    if (!role) {
      throw new NotFoundException('Organization role not found');
    }

    await this.requireOrganizationPermission(
      user.id,
      role.organization_id,
      PERMISSION_TYPE.role_assign
    );

    return this.db.$transaction(async (tx) => {
      const updatedRole = await tx.organizationRole.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          is_active: dto.is_active
        }
      });

      if (dto.permission_ids) {
        await tx.organizationRolePermission.deleteMany({
          where: { org_role_id: id }
        });

        if (dto.permission_ids.length > 0) {
          await tx.organizationRolePermission.createMany({
            data: dto.permission_ids.map(permissionId => ({
              org_role_id: id,
              org_permission_id: permissionId
            }))
          });
        }
      }

      this.logger.log(`Organization role updated: ${updatedRole.name} by user ${user.id}`);
      return this.getOrganizationRoleById(id);
    });
  }

  async getOrganizationRoles(organizationId: string, query: QueryRolesDto, user: User) {
    await this.requireOrganizationPermission(
      user.id,
      organizationId,
      PERMISSION_TYPE.collaborator_manage
    );

    const where: any = {
      organization_id: organizationId
    };

    if (query.type && Object.values(ORG_ROLE_TYPE).includes(query.type as ORG_ROLE_TYPE)) {
      where.type = query.type;
    }

    if (query.is_active !== undefined) {
      where.is_active = query.is_active;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    return this.db.organizationRole.findMany({
      where,
      include: {
        permissions: {
          include: {
            org_permission: true
          }
        },
        _count: {
          select: { user_roles: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getOrganizationRoleById(id: string) {
    const role = await this.db.organizationRole.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            org_permission: true
          }
        },
        user_roles: {
          include: {
            collaboration: {
              include: {
                collaborator: {
                  select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!role) {
      throw new NotFoundException('Organization role not found');
    }

    return role;
  }

  // ======== COLLABORATOR MANAGEMENT ========
  async inviteCollaborator(dto: InviteCollaboratorDto, user: User) {
    await this.requireOrganizationPermission(
      user.id,
      user.id,
      PERMISSION_TYPE.collaborator_invite
    );

    return this.db.$transaction(async (tx) => {
      // Check if user exists
      let collaborator = await tx.user.findUnique({
        where: { email: dto.email }
      });

      if (!collaborator) {
        // Create a temporary user account
        collaborator = await tx.user.create({
          data: {
            email: dto.email,
            firstname: dto.name.split(' ')[0] || dto.name,
            lastname: dto.name.split(' ').slice(1).join(' ') || '',
            type: 'host', // Default type
            // No password - will be set when they accept invitation
          }
        });
      }

      // Check if collaboration already exists
      const existingCollaboration = await tx.collaboration.findUnique({
        where: {
          collaborator_id_organization_id: {
            collaborator_id: collaborator.id,
            organization_id: user.id
          }
        }
      });

      if (existingCollaboration && existingCollaboration.is_active) {
        throw new BadRequestException('User is already a collaborator');
      }

      // Create or update collaboration
      const collaboration = await tx.collaboration.upsert({
        where: {
          collaborator_id_organization_id: {
            collaborator_id: collaborator.id,
            organization_id: user.id
          }
        },
        update: {
          status: 'pending',
          invited_at: new Date(),
          expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
          is_active: true
        },
        create: {
          collaborator_id: collaborator.id,
          organization_id: user.id,
          email: dto.email,
          invited_by: user.id,
          expires_at: dto.expires_at ? new Date(dto.expires_at) : null
        }
      });

      // Assign role if provided
      if (dto.role_id) {
        await tx.userOrganizationRole.create({
          data: {
            collaboration_id: collaboration.id,
            org_role_id: dto.role_id,
            assigned_by: user.id
          }
        });
      }

      // Assign direct permissions if provided
      if (dto.permission_ids && dto.permission_ids.length > 0) {
        await tx.userPermission.createMany({
          data: dto.permission_ids.map(permissionId => ({
            user_id: collaborator.id,
            org_permission_id: permissionId,
            organization_id: user.id,
            granted_by: user.id
          }))
        });
      }

      // Send invitation email
      await this.sendCollaborationInviteEmail(
        dto.email,
        user.firstname,
        collaboration.id
      );

      this.logger.log(`Collaborator invited: ${dto.email} by user ${user.id}`);
      return this.getCollaborationById(collaboration.id);
    });
  }

  async acceptCollaboration(collaborationId: string, userId: string) {
    const collaboration = await this.db.collaboration.findUnique({
      where: { id: collaborationId }
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    return collaboration;
  }

  async updateCollaborator(id: string, dto: UpdateCollaboratorDto, user: User) {
    const collaboration = await this.db.collaboration.findUnique({
      where: { id }
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    await this.requireOrganizationPermission(
      user.id,
      collaboration.organization_id,
      PERMISSION_TYPE.collaborator_manage
    );

    return this.db.$transaction(async (tx) => {
      const updatedCollaboration = await tx.collaboration.update({
        where: { id },
        data: {
          is_active: dto.is_active
        }
      });

      // Update role if provided
      if (dto.role_id) {
        // Remove existing roles
        await tx.userOrganizationRole.deleteMany({
          where: { collaboration_id: id }
        });

        // Assign new role
        await tx.userOrganizationRole.create({
          data: {
            collaboration_id: id,
            org_role_id: dto.role_id,
            assigned_by: user.id
          }
        });
      }

      // Update permissions if provided
      if (dto.permission_ids) {
        // Remove existing organization permissions for this user
        await tx.userPermission.deleteMany({
          where: {
            user_id: collaboration.collaborator_id,
            organization_id: collaboration.organization_id,
            org_permission_id: { not: null }
          }
        });

        // Assign new permissions
        if (dto.permission_ids.length > 0) {
          await tx.userPermission.createMany({
            data: dto.permission_ids.map(permissionId => ({
              user_id: collaboration.collaborator_id,
              org_permission_id: permissionId,
              organization_id: collaboration.organization_id,
              granted_by: user.id
            }))
          });
        }
      }

      this.logger.log(`Collaborator updated: ${id} by user ${user.id}`);
      return this.getCollaborationById(id);
    });
  }

  async removeCollaborator(id: string, user: User) {
    const collaboration = await this.db.collaboration.findUnique({
      where: { id }
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    await this.requireOrganizationPermission(
      user.id,
      collaboration.organization_id,
      PERMISSION_TYPE.collaborator_manage
    );

    await this.db.collaboration.update({
      where: { id },
      data: { is_active: false }
    });

    this.logger.log(`Collaborator removed: ${id} by user ${user.id}`);
    return { message: 'Collaborator removed successfully' };
  }

  // ======== PERMISSIONS MANAGEMENT ========
  async createSystemPermission(dto: CreateSystemPermissionDto, user: User) {
    await this.requireSystemPermission(user.id, PERMISSION_TYPE.permission_grant);

    const permission = await this.db.systemPermission.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        resource: dto.resource,
        action: dto.action
      }
    });

    this.logger.log(`System permission created: ${permission.name} by user ${user.id}`);
    return permission;
  }

  async updateSystemPermission(id: string, dto: UpdateSystemPermissionDto, user: User) {
    await this.requireSystemPermission(user.id, PERMISSION_TYPE.permission_grant);

    const permission = await this.db.systemPermission.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        resource: dto.resource,
        action: dto.action,
        is_active: dto.is_active
      }
    });

    this.logger.log(`System permission updated: ${permission.name} by user ${user.id}`);
    return permission;
  }

  async getSystemPermissions(query: QueryPermissionsDto) {
    const where: any = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.resource) {
      where.resource = { contains: query.resource, mode: 'insensitive' };
    }

    if (query.is_active !== undefined) {
      where.is_active = query.is_active;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    return this.db.systemPermission.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });
  }

  async createOrganizationPermission(dto: CreateSystemPermissionDto, user: User) {
    await this.requireOrganizationPermission(user.id, user.id, PERMISSION_TYPE.permission_grant);

    const permission = await this.db.organizationPermission.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        resource: dto.resource,
        action: dto.action,
        organization_id: user.id
      }
    });

    this.logger.log(`Organization permission created: ${permission.name} by user ${user.id}`);
    return permission;
  }

  async getOrganizationPermissions(organizationId: string, query: QueryPermissionsDto, user: User) {
    await this.requireOrganizationPermission(
      user.id,
      organizationId,
      PERMISSION_TYPE.collaborator_manage
    );

    const where: any = {
      organization_id: organizationId
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.resource) {
      where.resource = { contains: query.resource, mode: 'insensitive' };
    }

    if (query.is_active !== undefined) {
      where.is_active = query.is_active;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    return this.db.organizationPermission.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });
  }

  // ======== ROLE ASSIGNMENT ========
  async assignSystemRole(dto: AssignRoleDto, user: User) {
    await this.requireSystemPermission(user.id, PERMISSION_TYPE.role_assign);

    const existingAssignment = await this.db.userSystemRole.findUnique({
      where: {
        user_id_system_role_id: {
          user_id: dto.user_id,
          system_role_id: dto.role_id
        }
      }
    });

    if (existingAssignment && existingAssignment.is_active) {
      throw new BadRequestException('User already has this system role');
    }

    const assignment = await this.db.userSystemRole.upsert({
      where: {
        user_id_system_role_id: {
          user_id: dto.user_id,
          system_role_id: dto.role_id
        }
      },
      update: {
        is_active: true,
        assigned_by: user.id,
        assigned_at: new Date(),
        expires_at: dto.expires_at ? new Date(dto.expires_at) : null
      },
      create: {
        user_id: dto.user_id,
        system_role_id: dto.role_id,
        assigned_by: user.id,
        expires_at: dto.expires_at ? new Date(dto.expires_at) : null
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true
          }
        },
        system_role: true
      }
    });

    await this.notificationService.send({
      userId: dto.user_id,
      userEmail: assignment.user.email,
      feature: NotificationFeature.USER_MANAGEMENT,
      message: `You have been assigned the system role: ${assignment.system_role.name}`,
      type: NOTIFICATIONTYPE.INFO
    });

    this.logger.log(`System role assigned: ${dto.role_id} to user ${dto.user_id} by ${user.id}`);
    return assignment;
  }

  async revokeSystemRole(dto: RevokeRoleDto, user: User) {
    await this.requireSystemPermission(user.id, PERMISSION_TYPE.role_assign);

    const assignment = await this.db.userSystemRole.findUnique({
      where: {
        user_id_system_role_id: {
          user_id: dto.user_id,
          system_role_id: dto.role_id
        }
      },
      include: {
        user: {
          select: { email: true }
        },
        system_role: true
      }
    });

    if (!assignment) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.db.userSystemRole.update({
      where: {
        user_id_system_role_id: {
          user_id: dto.user_id,
          system_role_id: dto.role_id
        }
      },
      data: { is_active: false }
    });

    await this.notificationService.send({
      userId: dto.user_id,
      userEmail: assignment.user.email,
      feature: NotificationFeature.USER_MANAGEMENT,
      message: `Your system role has been revoked: ${assignment.system_role.name}`,
      type: NOTIFICATIONTYPE.WARNING
    });

    this.logger.log(`System role revoked: ${dto.role_id} from user ${dto.user_id} by ${user.id}`);
    return { message: 'System role revoked successfully' };
  }

  // ======== PERMISSION ASSIGNMENT ========
  async assignPermission(dto: AssignPermissionDto, organizationId: string, user: User) {
    await this.requireOrganizationPermission(
      user.id,
      organizationId,
      PERMISSION_TYPE.permission_grant
    );

    if (!dto.permission_id && !dto.org_permission_id) {
      throw new BadRequestException('Either permission_id or org_permission_id must be provided');
    }

    const permission = await this.db.userPermission.create({
      data: {
        user_id: dto.user_id,
        permission_id: dto.permission_id,
        org_permission_id: dto.org_permission_id,
        organization_id: organizationId,
        granted_by: user.id,
        expires_at: dto.expires_at ? new Date(dto.expires_at) : null
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true
          }
        },
        permission: true,
        org_permission: true
      }
    });

    const permissionName = permission.permission?.name || permission.org_permission?.name;
    await this.notificationService.send({
      userId: dto.user_id,
      userEmail: permission.user.email,
      feature: NotificationFeature.USER_MANAGEMENT,
      message: `You have been granted permission: ${permissionName}`,
      type: NOTIFICATIONTYPE.INFO
    });

    this.logger.log(`Permission assigned: ${permissionName} to user ${dto.user_id} by ${user.id}`);
    return permission;
  }

  async revokePermission(dto: RevokePermissionDto, organizationId: string, user: User) {
    await this.requireOrganizationPermission(
      user.id,
      organizationId,
      PERMISSION_TYPE.permission_grant
    );

    const where: any = {
      user_id: dto.user_id,
      organization_id: organizationId
    };

    if (dto.permission_id) {
      where.permission_id = dto.permission_id;
    }

    if (dto.org_permission_id) {
      where.org_permission_id = dto.org_permission_id;
    }

    const permission = await this.db.userPermission.findFirst({
      where,
      include: {
        user: { select: { email: true } },
        permission: true,
        org_permission: true
      }
    });

    if (!permission) {
      throw new NotFoundException('Permission assignment not found');
    }

    await this.db.userPermission.update({
      where: { id: permission.id },
      data: { is_active: false }
    });

    const permissionName = permission.permission?.name || permission.org_permission?.name;
    await this.notificationService.send({
      userId: dto.user_id,
      userEmail: permission.user.email,
      feature: NotificationFeature.USER_MANAGEMENT,
      message: `Your permission has been revoked: ${permissionName}`,
      type: NOTIFICATIONTYPE.WARNING
    });

    this.logger.log(`Permission revoked: ${permissionName} from user ${dto.user_id} by ${user.id}`);
    return { message: 'Permission revoked successfully' };
  }

  // ======== BULK OPERATIONS ========
  async bulkAssignRoles(dto: BulkAssignRolesDto, user: User) {
    await this.requireSystemPermission(user.id, PERMISSION_TYPE.role_assign);

    const assignments = [];
    for (const userId of dto.user_ids) {
      for (const roleId of dto.role_ids) {
        try {
          const assignment = await this.assignSystemRole(
            {
              user_id: userId,
              role_id: roleId,
              expires_at: dto.expires_at
            },
            user
          );
          assignments.push(assignment);
        } catch (error) {
          this.logger.warn(`Failed to assign role ${roleId} to user ${userId}: ${error.message}`);
        }
      }
    }

    this.logger.log(`Bulk role assignment completed: ${assignments.length} assignments by ${user.id}`);
    return {
      message: `Successfully assigned ${assignments.length} roles`,
      assignments
    };
  }

  async bulkAssignPermissions(dto: BulkAssignPermissionsDto, organizationId: string, user: User) {
    await this.requireOrganizationPermission(
      user.id,
      organizationId,
      PERMISSION_TYPE.permission_grant
    );

    const assignments = [];
    for (const userId of dto.user_ids) {
      for (const permissionId of dto.permission_ids) {
        try {
          const assignment = await this.assignPermission(
            {
              user_id: userId,
              org_permission_id: permissionId,
              expires_at: dto.expires_at
            },
            organizationId,
            user
          );
          assignments.push(assignment);
        } catch (error) {
          this.logger.warn(`Failed to assign permission ${permissionId} to user ${userId}: ${error.message}`);
        }
      }
    }

    this.logger.log(`Bulk permission assignment completed: ${assignments.length} assignments by ${user.id}`);
    return {
      message: `Successfully assigned ${assignments.length} permissions`,
      assignments
    };
  }

  // ======== USER PERMISSIONS RETRIEVAL ========
  async getUserPermissions(userId: string, organizationId?: string) {
    const systemPermissions = await this.db.userSystemRole.findMany({
      where: {
        user_id: userId,
        is_active: true,
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } }
        ]
      },
      include: {
        system_role: {
          include: {
            permissions: {
              include: {
                system_permission: true
              }
            }
          }
        }
      }
    });

    const directPermissions = await this.db.userPermission.findMany({
      where: {
        user_id: userId,
        is_active: true,
        organization_id: organizationId,
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } }
        ]
      },
      include: {
        permission: true,
        org_permission: true
      }
    });

    const organizationRoles = organizationId ? await this.db.collaboration.findUnique({
      where: {
        collaborator_id_organization_id: {
          collaborator_id: userId,
          organization_id: organizationId
        }
      },
      include: {
        roles: {
          include: {
            org_role: {
              include: {
                permissions: {
                  include: {
                    org_permission: true
                  }
                }
              }
            }
          }
        }
      }
    }) : null;

    return {
      system_permissions: systemPermissions.flatMap(role =>
        role.system_role.permissions.map(p => p.system_permission)
      ),
      direct_permissions: directPermissions.map(p => p.permission || p.org_permission),
      organization_role_permissions: organizationRoles?.roles.flatMap(role =>
        role.org_role.permissions.map(p => p.org_permission)
      ) || []
    };
  }

  // ======== EMAIL UTILITIES ========
  private async sendCollaborationInviteEmail(
    email: string,
    inviterName: string,
    collaborationId: string
  ) {
    const inviteLink = `${process.env.FRONTEND_BASEURL}/collaboration/accept/${collaborationId}`;

    const emailContent = `
      <h2>You've been invited to collaborate!</h2>
      <p>Hi there,</p>
      <p>${inviterName} has invited you to collaborate on their events platform.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${inviteLink}" style="background-color: #db5f12; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none;">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
      <p>Best regards,<br>E-vent Team</p>
    `;

    await this.emailService.sendEmail(
      email,
      'Collaboration Invitation',
      emailContent
    );
  }

  // ======== SEED DEFAULT ORGANIZATION PERMISSIONS ========
  async seedDefaultOrganizationPermissions(organizationId: string) {
    const defaultPermissions = [
      {
        name: 'Event Sourcing',
        type: PERMISSION_TYPE.event_sourcing,
        description: 'Access to event sourcing features',
        resource: 'events',
        action: 'source'
      },
      {
        name: 'Planner Access',
        type: PERMISSION_TYPE.planner,
        description: 'Access to planning features',
        resource: 'planning',
        action: 'access'
      },
      {
        name: 'Backoffice Access',
        type: PERMISSION_TYPE.backoffice,
        description: 'Access to backoffice features',
        resource: 'backoffice',
        action: 'access'
      },
      {
        name: 'CRM Access',
        type: PERMISSION_TYPE.crm,
        description: 'Access to CRM features',
        resource: 'crm',
        action: 'access'
      }
    ];

    const createdPermissions = [];
    for (const permission of defaultPermissions) {
      try {
        const created = await this.db.organizationPermission.create({
          data: {
            ...permission,
            organization_id: organizationId
          }
        });
        createdPermissions.push(created);
      } catch (error) {
        // Permission might already exist
        this.logger.warn(`Permission ${permission.name} already exists for organization ${organizationId}`);
      }
    }

    return createdPermissions;
  }

  async seedDefaultOrganizationRoles(organizationId: string) {
    const permissions = await this.db.organizationPermission.findMany({
      where: { organization_id: organizationId }
    });

    const defaultRoles = [
      {
        name: 'Admin',
        type: ORG_ROLE_TYPE.admin,
        description: 'Full access to all organization features',
        permissions: permissions.map(p => p.id) // All permissions
      },
      {
        name: 'Manager',
        type: ORG_ROLE_TYPE.manager,
        description: 'Management access with limited administrative rights',
        permissions: permissions
          .filter(p => [PERMISSION_TYPE.event_sourcing, PERMISSION_TYPE.planner, PERMISSION_TYPE.crm].includes(p.type))
          .map(p => p.id)
      },
      {
        name: 'Member',
        type: ORG_ROLE_TYPE.member,
        description: 'Basic access to organization features',
        permissions: permissions
          .filter(p => [PERMISSION_TYPE.event_sourcing, PERMISSION_TYPE.planner].includes(p.type))
          .map(p => p.id)
      }
    ];

    const createdRoles = [];
    for (const role of defaultRoles) {
      try {
        const created = await this.db.$transaction(async (tx) => {
          const createdRole = await tx.organizationRole.create({
            data: {
              name: role.name,
              type: role.type,
              description: role.description,
              organization_id: organizationId
            }
          });

          if (role.permissions.length > 0) {
            await tx.organizationRolePermission.createMany({
              data: role.permissions.map(permissionId => ({
                org_role_id: createdRole.id,
                org_permission_id: permissionId
              }))
            });
          }

          return createdRole;
        });

        createdRoles.push(created);
      } catch (error) {
        this.logger.warn(`Role ${role.name} already exists for organization ${organizationId}`);
      }
    }

    return createdRoles;
  }
}
      throw new NotFoundException('Collaboration invitation not found');
    }

    if (collaboration.collaborator_id !== userId) {
      throw new UnauthorizedException('Invalid collaboration invitation');
    }

    if (collaboration.expires_at && collaboration.expires_at < new Date()) {
      throw new BadRequestException('Collaboration invitation has expired');
    }

    const updatedCollaboration = await this.db.collaboration.update({
      where: { id: collaborationId },
      data: {
        status: 'accepted',
        accepted_at: new Date()
      }
    });

    await this.notificationService.send({
      userId: collaboration.organization_id,
      userEmail: (await this.db.user.findUnique({ where: { id: collaboration.organization_id } }))?.email || '',
      feature: NotificationFeature.USER_MANAGEMENT,
      message: `${collaboration.email} has accepted your collaboration invitation`,
      type: NOTIFICATIONTYPE.INFO
    });

    this.logger.log(`Collaboration accepted: ${collaborationId} by user ${userId}`);
    return updatedCollaboration;
  }

  async getCollaborators(organizationId: string, query: QueryCollaboratorsDto, user: User) {
    await this.requireOrganizationPermission(
      user.id,
      organizationId,
      PERMISSION_TYPE.collaborator_manage
    );

    const where: any = {
      organization_id: organizationId
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.is_active !== undefined) {
      where.is_active = query.is_active;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        {
          collaborator: {
            OR: [
              { firstname: { contains: query.search, mode: 'insensitive' } },
              { lastname: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    if (query.role_id) {
      where.roles = {
        some: {
          org_role_id: query.role_id
        }
      };
    }

    return this.db.collaboration.findMany({
      where,
      include: {
        collaborator: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            avatar: true
          }
        },
        roles: {
          include: {
            org_role: {
              include: {
                permissions: {
                  include: {
                    org_permission: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { invited_at: 'desc' }
    });
  }

  async getCollaborationById(id: string) {
    const collaboration = await this.db.collaboration.findUnique({
      where: { id },
      include: {
        collaborator: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            avatar: true
          }
        },
        organization: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true
          }
        },
        roles: {
          include: {
            org_role: {
              include: {
                permissions: {
                  include: {
                    org_permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!collaboration) {