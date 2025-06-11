import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from "@nestjs/swagger";
import { OrganizationService } from "./organization.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { Organization } from "@prisma/client";
import { AuthGuard } from "../../auth/guard";

@ApiTags("Organizations")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations")
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new organization" })
  @ApiResponse({
    status: 201,
    description: "Organization created successfully",
    type: Object
  })
  async createOrganization(
    @Body() dto: CreateOrganizationDto
  ): Promise<Organization> {
    return this.organizationService.createOrganization(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get organization by ID" })
  @ApiResponse({
    status: 200,
    description: "Organization retrieved successfully",
    type: Object
  })
  async getOrganizationById(@Param("id") id: string): Promise<Organization> {
    return this.organizationService.getOrganizationById(id);
  }

  @Get()
  @ApiOperation({ summary: "Get all organizations for a user" })
  @ApiResponse({
    status: 200,
    description: "Organizations retrieved successfully",
    type: [Object]
  })
  async getOrganizationsForUser(
    @Query("userId") userId: string
  ): Promise<Organization[]> {
    return this.organizationService.getOrganizationsForUser(userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update organization details" })
  @ApiResponse({
    status: 200,
    description: "Organization updated successfully",
    type: Object
  })
  async updateOrganization(
    @Param("id") id: string,
    @Body() dto: UpdateOrganizationDto
  ): Promise<Organization> {
    return this.organizationService.updateOrganization(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete (soft) an organization" })
  @ApiResponse({
    status: 200,
    description: "Organization deleted successfully"
  })
  async deleteOrganization(@Param("id") id: string): Promise<void> {
    return this.organizationService.deleteOrganization(id);
  }
}
