import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { User } from "./entities/user.entity";
import { CurrentUser } from "src/common/decorators";
import { JwtUser } from "src/common/types";
import { AuthGuard } from "src/auth/guard";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new user",
    description: "Creates a new user account with the provided information"
  })
  @ApiResponse({
    status: 201,
    description: "User successfully created",
    type: User
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: {
          type: "array",
          items: { type: "string" },
          example: [
            "Email must be a valid email address",
            "Password is too weak"
          ]
        },
        error: { type: "string", example: "Bad Request" }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: "User with this email already exists"
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all users",
    description: "Retrieves a list of all users (requires authentication)"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Users retrieved successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "Users retrieved successfully" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "number",
                example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
              },
              firstname: { type: "string", example: "John" },
              lastname: { type: "string", example: "Doe" },
              email: { type: "string", example: "john.doe@example.com" },
              type: { type: "string", example: "customer" },
              exhibit: { type: "string", example: "booth", nullable: true },
              provider: { type: "string", example: "local" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get user by ID",
    description:
      "Retrieves a specific user by their ID (requires authentication)"
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "User ID",
    example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User found successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "User retrieved successfully" },
        data: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
            },
            firstname: { type: "string", example: "John" },
            lastname: { type: "string", example: "Doe" },
            email: { type: "string", example: "john.doe@example.com" },
            type: { type: "string", example: "customer" },
            exhibit: { type: "string", example: "booth", nullable: true },
            provider: { type: "string", example: "local" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        message: { type: "string", example: "Record not found" },
        error: { type: "string", example: "NotFoundError" }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update user",
    description: "Updates a user by ID (requires authentication)"
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "User ID",
    example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
  })
  @ApiBody({
    type: UpdateUserDto,
    description: "User update data",
    examples: {
      basic: {
        summary: "Basic Update",
        description: "Update basic user information",
        value: {
          firstname: "John",
          lastname: "Smith"
        }
      },
      email: {
        summary: "Email Update",
        description: "Update user email",
        value: {
          email: "newemail@example.com"
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User updated successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "User updated successfully" },
        data: {
          type: "object",
          properties: {
            id: {
              type: "number",
              example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
            },
            firstname: { type: "string", example: "John" },
            lastname: { type: "string", example: "Smith" },
            email: { type: "string", example: "newemail@example.com" },
            type: { type: "string", example: "customer" },
            exhibit: { type: "string", example: "booth", nullable: true },
            provider: { type: "string", example: "local" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Email already exists (if updating email)"
  })
  async update(
    @Param("id", ParseIntPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Delete user",
    description: "Deletes a user by ID (requires authentication)"
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "User ID",
    example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User deleted successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "User deleted successfully" },
        data: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "User John Doe has been successfully deleted"
            },
            deletedUser: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                  example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
                },
                firstname: { type: "string", example: "John" },
                lastname: { type: "string", example: "Doe" },
                email: { type: "string", example: "john.doe@example.com" }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async remove(
    @Param("id", ParseIntPipe) id: string
  ): Promise<{ message: string; deletedUser: Partial<User> }> {
    return this.usersService.remove(id);
  }

  @Get("profile/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get current user profile",
    description: "Retrieves the current authenticated user profile"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Current user profile retrieved successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "Profile retrieved successfully" },
        data: {
          type: "object",
          properties: {
            id: {
              type: "number",
              example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
            },
            firstname: { type: "string", example: "John" },
            lastname: { type: "string", example: "Doe" },
            email: { type: "string", example: "john.doe@example.com" },
            type: { type: "string", example: "customer" },
            exhibit: { type: "string", example: "booth", nullable: true },
            provider: { type: "string", example: "local" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async getProfile(@CurrentUser() user: JwtUser): Promise<User | null> {
    return this.usersService.findOne(user.id);
  }

  @Patch("profile/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update current user profile",
    description: "Updates the current authenticated user profile"
  })
  @ApiBody({
    type: UpdateUserDto,
    description: "Profile update data",
    examples: {
      name: {
        summary: "Update Name",
        description: "Update first and last name",
        value: {
          firstname: "John",
          lastname: "Smith"
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Profile updated successfully"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Get("stats/count")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get user count",
    description: "Retrieves the total number of users (requires authentication)"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User count retrieved successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "User count retrieved successfully"
        },
        data: {
          type: "object",
          properties: {
            count: { type: "number", example: 150 }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async getUserCount(): Promise<{ count: number }> {
    const count = await this.usersService.count();
    return { count };
  }

  @Get(":id/exists")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Check if user exists",
    description: "Checks if a user exists by ID (requires authentication)"
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "User ID",
    example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User existence check completed",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "User existence checked successfully"
        },
        data: {
          type: "object",
          properties: {
            exists: { type: "boolean", example: true },
            id: {
              type: "string",
              example: "7b2186dd-ae36-40da-8b95-1f6a88c99876"
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async checkUserExists(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<{ exists: boolean; id: string }> {
    const exists = await this.usersService.exists(id);
    return { exists, id };
  }
}
