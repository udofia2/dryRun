import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger
} from "@nestjs/common";
import { UpdateUserDto } from "./dtos/update-user.dto";
import {
  EXHIBITTYPE,
  ORG_ROLE_TYPE,
  Prisma,
  PROVIDER,
  SYSTEM_ROLE_TYPE,
  User,
  USERTYPE
} from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import { SocialAuthDto } from "src/auth/dto";
import { CreateUserDto } from "./dtos";
import { AuthProvider } from "src/common/types";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { NotificationFeature } from "src/domains/notifications/dto/create-notification.dto";
import * as argon from "argon2";
import { ExhibitType } from "src/constants";
import { NOTIFICATIONTYPE } from "src/domains/notifications/dto/send-notification.dto";
import { RolesPermissionsService } from "src/domains/roles-permissions/roles-permissions.service";
import { OrganizationService } from "src/domains/organization/organization.service";

export interface UserResponse {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  type: USERTYPE;
  provider: string;
  providerId?: string;
  avatar?: string;
  city?: string;
  state?: string;
  exhibit: EXHIBITTYPE;
  created_at: Date;
  updated_at: Date;
  deleted?: boolean;
  deleted_at?: Date;
  organization?: {
    id: string;
    name: string;
    isOwner: boolean;
  };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private db: DatabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly rolesPermissionsService: RolesPermissionsService,
    private readonly organizationsService: OrganizationService
  ) {}

  /**
   * Creates a new user
   * @param {CreateUserDto | SocialAuthDto} dto - user data (pre-validated by class-validator)
   * @returns {Promise<User>} - the newly created user
   * @throws Prisma errors are caught and re-thrown for global error filter
   */
  public async create(
    dto: CreateUserDto | SocialAuthDto
  ): Promise<UserResponse> {
    try {
      this.logger.log(`Attempting to create user with email: ${dto.email}`);

      dto.email = dto.email.toLowerCase();

      const userExists = await this.db.user.findUnique({
        where: { email: dto.email }
      });
      if (userExists) {
        throw new ForbiddenException("User already exists. Please login");
      }

      if (
        "type" in dto &&
        dto.type === "vendor" &&
        "exhibit" in dto &&
        !ExhibitType.has(dto.exhibit)
      ) {
        throw new ForbiddenException("Invalid exhibit type");
      }

      dto.password = await argon.hash(dto.password);

      // const user: User = await this.db.user.create({
      //   data: { ...dto, provider: "local" }
      // });

      // Extract organization name from email
      const organizationName = this.extractOrganizationName(dto.email);

      const result = await this.db.$transaction(
        async (tx) => {
          // 1. Create the user first
          const user: User = await tx.user.create({
            data: {
              ...dto,
              provider: "provider" in dto ? dto.provider : PROVIDER.local
            }
          });

          // Find or create organization
          const organization =
            await this.organizationsService.createOrganization(
              {
                name: organizationName,
                ownerId: user.id
              },
              tx
            );

          //Assign system roles based on user type
          await this.assignSystemRoles(user, tx);

          //Assign organization roles
          const isOwner = await this.assignOrganizationRoles(
            tx,
            user,
            organization.id,
            organization.ownerId === user.id
          );

          // Setup default permissions if first user in organization
          if (organization.ownerId === user.id) {
            await this.setupDefaultOrganizationStructure(tx, user.id);
          }

          return {
            user,
            organization: {
              id: organization.id,
              name: organization.name,
              isOwner: organization.ownerId === user.id
            }
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
          timeout: 10000
        }
      );

      await this.notificationsService.send({
        userId: result.user.id,
        userEmail: result.user.email,
        userPhone: result.user.phone,
        feature: NotificationFeature.USER_MANAGEMENT,
        message: `Welcome to our platform, ${result.user.firstname}! Your account has been successfully created.`,
        type: NOTIFICATIONTYPE.INFO
      });

      this.logger.log(
        `Successfully created user with ID: ${result.user.id}, email: ${result.user.email}`
      );

      delete result.user.password;

      return {
        ...result.user,
        organization: result.organization
      };
    } catch (error) {
      this.logger.error(
        `Failed to create user with email: ${dto.email}`,
        error instanceof Error ? error.stack : "Unknown error"
      );

      throw error;
    }
  }

  /**
   * Finds a user by email
   * @param {string} email - the user email to query against the database
   * @returns {Promise<User | null>} - the user with the email or null if not found
   */
  public async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.db.user.findUnique({
        where: { email }
      });
    } catch (error) {
      this.logger.error(
        `Failed to find user by email: ${email}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Finds a user by provider and email
   * @param {string} email - the user email to query against the database
   * @param {AuthProvider} provider - the provider to query against the database
   * @returns {Promise<User | null>} - the user with the email or null if not found
   */
  public async findByProvider(
    email: string,
    provider: AuthProvider
  ): Promise<User | null> {
    try {
      return await this.db.user.findUnique({
        where: { email, provider }
      });
    } catch (error) {
      this.logger.error(
        `Failed to find user by provider: ${email}, ${provider}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }
  /**
   * Finds all users with optional filtering and pagination
   * @returns {Promise<User[]>} - array of users
   */
  public async findAll(): Promise<UserResponse[]> {
    try {
      this.logger.log("Fetching all users");

      const users = await this.db.user.findMany({
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          type: true,
          exhibit: true,
          provider: true,
          providerId: true,
          avatar: true,
          city: true,
          state: true,
          booked_dates: true,
          created_at: true,
          updated_at: true
        },
        orderBy: {
          created_at: "desc"
        }
      });

      this.logger.log(`Successfully fetched ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error(
        "Failed to fetch all users",
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Finds a single user by ID
   * @param {string} id - the user ID
   * @returns {Promise<User | null>} - the user or null if not found
   */
  public async findOne(id: string): Promise<UserResponse | null> {
    try {
      this.logger.log(`Fetching user with ID: ${id}`);

      const user = await this.db.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          type: true,
          exhibit: true,
          provider: true,
          providerId: true,
          avatar: true,
          city: true,
          state: true,
          booked_dates: true,
          created_at: true,
          updated_at: true
        }
      });

      if (user) {
        this.logger.log(`Successfully found user with ID: ${id}`);
      } else {
        this.logger.log(`User with ID: ${id} not found`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to find user with ID: ${id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Updates a user by ID
   * @param {string} id - the user ID
   * @param {UpdateUserDto} updateUserDto - the data to update
   * @returns {Promise<User>} - the updated user
   */
  public async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserResponse> {
    try {
      this.logger.log(`Attempting to update user with ID: ${id}`);

      // Check if user exists first
      const existingUser = await this.db.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        this.logger.error(`User with ID: ${id} not found for update`);
        throw new Error(`User with ID ${id} not found`);
      }

      const updatedUser = await this.db.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          type: true,
          exhibit: true,
          provider: true,
          providerId: true,
          avatar: true,
          city: true,
          state: true,
          booked_dates: true,
          created_at: true,
          updated_at: true
        }
      });

      await this.notificationsService.create({
        feature: NotificationFeature.USER_MANAGEMENT,
        message: `Your profile has been successfully updated.`,
        user_id: updatedUser.id
      });

      this.logger.log(`Successfully updated user with ID: ${id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Failed to update user with ID: ${id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Soft delete or hard delete a user by ID
   * @param {string} id - the user ID
   * @returns {Promise<{ message: string; deletedUser: Partial<User> }>} - confirmation message and deleted user info
   */
  public async remove(
    id: string
  ): Promise<{ message: string; deletedUser: Partial<User> }> {
    try {
      this.logger.log(`Attempting to delete user with ID: ${id}`);

      // Check if user exists first
      const existingUser = await this.db.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true
        }
      });

      if (!existingUser) {
        this.logger.error(`User with ID: ${id} not found for deletion`);
        throw new Error(`User with ID ${id} not found`);
      }

      await this.notificationsService.send({
        userId: existingUser.id,
        userEmail: existingUser.email,
        userPhone: existingUser.phone,
        feature: NotificationFeature.SECURITY,
        message: `Your account has been scheduled for deletion. If this wasn't you, please contact support immediately.`,
        type: NOTIFICATIONTYPE.WARNING
      });
      // Hard delete - soft delete to be implemented later
      await this.db.user.delete({
        where: { id }
      });

      this.logger.log(
        `Successfully deleted user with ID: ${id}, email: ${existingUser.email}`
      );

      return {
        message: `User ${existingUser.firstname} ${existingUser.lastname} has been successfully deleted`,
        deletedUser: existingUser
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete user with ID: ${id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Soft delete implementation (alternative to hard delete)
   * @param {string} id - the user ID
   * @returns {Promise<User>} - the soft deleted user
   */
  public async softDelete(id: string): Promise<UserResponse> {
    try {
      this.logger.log(`Attempting to soft delete user with ID: ${id}`);

      const softDeletedUser = await this.db.user.update({
        where: { id },
        data: {
          deleted: true,
          deleted_at: new Date(), // Assuming you have a deletedAt field
          // You might also want to anonymize email
          email: `deleted_${id}@deleted.com`
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          type: true,
          exhibit: true,
          provider: true,
          created_at: true,
          updated_at: true,
          deleted_at: true
        }
      });

      this.logger.log(`Successfully soft deleted user with ID: ${id}`);
      return softDeletedUser;
    } catch (error) {
      this.logger.error(
        `Failed to soft delete user with ID: ${id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Get user count with optional filters
   * @returns {Promise<number>} - total number of users
   */
  public async count(): Promise<number> {
    try {
      const count = await this.db.user.count({
        where: {
          deleted: false
        }
      });

      this.logger.log(`Total user count: ${count}`);
      return count;
    } catch (error) {
      this.logger.error(
        "Failed to get user count",
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Check if user exists by ID
   * @param {string} id - the user ID
   * @returns {Promise<boolean>} - true if user exists, false otherwise
   */
  public async exists(id: string): Promise<boolean> {
    try {
      const user = await this.db.user.findUnique({
        where: { id },
        select: { id: true }
      });

      return !!user;
    } catch (error) {
      this.logger.error(
        `Failed to check if user exists with ID: ${id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Extract organization name from email
   * @param email - User's email address
   * @returns Organization name
   */
  private extractOrganizationName(email: string): string {
    const domain = email.split("@")[1];
    const orgName = domain.split(".")[0];

    // Capitalize first letter and clean up
    return orgName.charAt(0).toUpperCase() + orgName.slice(1).toLowerCase();
  }

  /**
   * Assign system roles based on user type
   * @param tx - Database transaction
   * @param user - User object
   */
  private async assignSystemRoles(user: User, tx: any): Promise<void> {
    try {
      // Define system role mappings based on user type
      const systemRoleMapping: Record<USERTYPE, SYSTEM_ROLE_TYPE | null> = {
        [USERTYPE.host]: null, // No system role for regular hosts
        [USERTYPE.vendor]: null, // No system role for regular vendors
        [USERTYPE.internal]: SYSTEM_ROLE_TYPE.support // Internal users get support role
      };

      const systemRole = systemRoleMapping[user.type];

      if (systemRole) {
        // Find the system role
        const role = await tx.systemRole.findUnique({
          where: { type: systemRole }
        });

        if (role) {
          await tx.userSystemRole.create({
            data: {
              user_id: user.id,
              system_role_id: role.id,
              assigned_by: user.id // Self-assigned during registration
            }
          });

          this.logger.log(
            `Assigned system role ${systemRole} to user ${user.id}`
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to assign system roles to user ${user.id}:`,
        error
      );
      // Don't throw - system roles are not critical for user creation
    }
  }

  /**
   * Assign organization roles
   * @param tx - Database transaction
   * @param user - User object
   * @param organizationId - Organization ID
   * @param isOwner - Whether user is organization owner
   * @returns Whether user is owner
   */
  private async assignOrganizationRoles(
    tx: any,
    user: User,
    organizationId: string,
    isOwner: boolean
  ): Promise<boolean> {
    try {
      // If user is organization owner, they get full admin rights automatically
      if (isOwner) {
        this.logger.log(
          `User ${user.id} is organization owner, skipping role assignment`
        );
        return true;
      }

      // For non-owners, create collaboration and assign role based on user type
      const collaboration = await tx.collaboration.create({
        data: {
          collaborator_id: user.id,
          organization_id: organizationId,
          email: user.email,
          invited_by: organizationId, // Organization owner invited them
          status: "accepted", // Auto-accept since they're registering
          accepted_at: new Date()
        }
      });

      // Determine role based on user type
      const orgRoleMapping: Record<USERTYPE, ORG_ROLE_TYPE> = {
        [USERTYPE.host]: ORG_ROLE_TYPE.member,
        [USERTYPE.vendor]: ORG_ROLE_TYPE.member,
        [USERTYPE.internal]: ORG_ROLE_TYPE.admin
      };

      const roleType = orgRoleMapping[user.type];

      // Find the organization role
      const orgRole = await tx.organizationRole.findFirst({
        where: {
          organization_id: organizationId,
          type: roleType
        }
      });

      if (orgRole) {
        await tx.userOrganizationRole.create({
          data: {
            collaboration_id: collaboration.id,
            org_role_id: orgRole.id,
            assigned_by: organizationId // Assigned by organization owner
          }
        });

        this.logger.log(
          `Assigned organization role ${roleType} to user ${user.id}`
        );
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Failed to assign organization roles to user ${user.id}:`,
        error
      );
      return isOwner;
    }
  }

  /**
   * Setup default organization structure for new organization owners
   * @param tx - Database transaction
   * @param userId - User ID of organization owner
   */
  private async setupDefaultOrganizationStructure(
    tx: any,
    userId: string
  ): Promise<void> {
    try {
      // Create default organization permissions
      await this.rolesPermissionsService.seedDefaultOrganizationPermissions(
        userId
      );

      // Create default organization roles
      await this.rolesPermissionsService.seedDefaultOrganizationRoles(userId);

      this.logger.log(
        `Setup default organization structure for user ${userId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to setup organization structure for user ${userId}:`,
        error
      );
      // Don't throw - this is not critical for user creation
    }
  }
}
