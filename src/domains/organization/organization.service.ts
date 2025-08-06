import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { Organization, Prisma } from "@prisma/client";

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Create a new organization
   * @param dto - DTO with organization creation data
   * @returns Created organization
   */
  async createOrganization(
    dto: CreateOrganizationDto,
    tx?: Prisma.TransactionClient
  ): Promise<Organization> {
    const db = tx || this.db;
    try {
      const existingOrg = await db.organization.findFirst({
        where: {
          name: {
            equals: dto.name,
            mode: "insensitive"
          },
          ownerId: dto.ownerId
        }
      });

      if (existingOrg) {
        throw new ForbiddenException(
          "Organization with this name already exists for the user."
        );
      }

      const organization = await db.organization.create({
        data: {
          name: dto.name,
          ownerId: dto.ownerId
        }
      });

      this.logger.log(
        `Organization created: ${organization.name} (${organization.id})`
      );

      return organization;
    } catch (error) {
      this.logger.error(
        "Failed to create organization",
        error instanceof Error ? error.stack : error
      );
      throw error;
    }
  }

  /**
   * Get organization by ID
   * @param id - Organization ID
   * @returns Found organization
   */
  async getOrganizationById(id: string): Promise<Organization> {
    const organization = await this.db.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      throw new NotFoundException("Organization not found.");
    }

    return organization;
  }

  /**
   * Get all organizations a user is associated with (as owner or member)
   * @param userId - User's ID
   * @returns List of organizations
   */
  async getOrganizationsForUser(userId: string): Promise<Organization[]> {
    const organizations = await this.db.organization.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId
              }
            }
          }
        ]
      }
    });

    return organizations;
  }

  /**
   * Update organization details
   * @param id - Organization ID
   * @param dto - Data to update
   * @returns Updated organization
   */
  async updateOrganization(
    id: string,
    dto: UpdateOrganizationDto
  ): Promise<Organization> {
    const organization = await this.db.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      throw new NotFoundException("Organization not found.");
    }

    const updated = await this.db.organization.update({
      where: { id },
      data: {
        name: dto.name?.trim()
      }
    });

    this.logger.log(`Organization updated: ${updated.id}`);

    return updated;
  }

  /**
   * Delete (or soft-delete) organization
   * @param id - Organization ID
   */
  async deleteOrganization(id: string): Promise<void> {
    const organization = await this.db.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      throw new NotFoundException("Organization not found.");
    }

    // Soft delete
    await this.db.organization.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() }
    });

    this.logger.log(`Organization soft-deleted: ${id}`);
  }
}
