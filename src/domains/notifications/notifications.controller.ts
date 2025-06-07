import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  UseGuards,
  ParseIntPipe
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  QueryNotificationDto,
  BulkNotificationDto,
  NotificationFeature
} from "./dto/create-notification.dto";
import { Notification } from "@prisma/client";
import { AuthGuard } from "src/auth/guard";
import { CurrentUser } from "src/common/decorators";
import { JwtUser } from "src/common/types";
import { SendNotificationDto } from "./dto/send-notification.dto";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("send")
  @ApiOperation({
    summary: "Send multi-channel notification",
    description:
      "Sends notification via in-app, email, push, and SMS based on type and preferences"
  })
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto
  ): Promise<Notification> {
    return this.notificationsService.send(sendNotificationDto);
  }

  @Post()
  @ApiOperation({
    summary: "Create a new notification",
    description: "Creates a notification for a specific user"
  })
  @ApiBody({
    type: CreateNotificationDto,
    description: "Notification creation data",
    examples: {
      payment: {
        summary: "Payment Notification",
        description: "Notification for successful payment",
        value: {
          feature: "payment",
          message:
            "Your payment of $150.00 has been successfully processed for Event Registration.",
          user_id: "550e8400-e29b-41d4-a716-446655440000"
        }
      },
      booking: {
        summary: "Booking Confirmation",
        description: "Notification for event booking",
        value: {
          feature: "booking",
          message:
            'Your booking for "Tech Conference 2024" has been confirmed. Event starts on Dec 25, 2024.',
          user_id: "550e8400-e29b-41d4-a716-446655440000"
        }
      },
      reminder: {
        summary: "Event Reminder",
        description: "Reminder notification for upcoming event",
        value: {
          feature: "reminder",
          message:
            'Reminder: Your event "Tech Conference 2024" starts in 24 hours. Don\'t forget to check in!',
          user_id: "550e8400-e29b-41d4-a716-446655440000",
          date: "2024-12-24T10:00:00.000Z"
        }
      },
      system: {
        summary: "System Notification",
        description: "System-wide notification",
        value: {
          feature: "system",
          message:
            "System maintenance scheduled for tonight from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.",
          user_id: "550e8400-e29b-41d4-a716-446655440000"
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Notification created successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 201 },
        message: {
          type: "string",
          example: "Notification created successfully"
        },
        data: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000"
            },
            feature: { type: "string", example: "payment" },
            message: {
              type: "string",
              example: "Your payment has been processed successfully."
            },
            user_id: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000"
            },
            date: { type: "string", format: "date-time" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                firstname: { type: "string" },
                lastname: { type: "string" },
                email: { type: "string" }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: {
          type: "array",
          items: { type: "string" },
          example: [
            "Message must be at least 10 characters long",
            "User ID must be a valid UUID v4"
          ]
        },
        error: { type: "string", example: "Bad Request" }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all notifications",
    description:
      "Retrieves notifications with optional filtering and pagination"
  })
  @ApiQuery({
    name: "feature",
    required: false,
    enum: NotificationFeature,
    description: "Filter by notification feature",
    example: "payment"
  })
  @ApiQuery({
    name: "user_id",
    required: false,
    type: String,
    description: "Filter by user ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of notifications to return",
    example: 20
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Number of notifications to skip",
    example: 0
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search in notification messages",
    example: "payment"
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "Start date for filtering (ISO 8601)",
    example: "2024-01-01T00:00:00.000Z"
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "End date for filtering (ISO 8601)",
    example: "2024-12-31T23:59:59.999Z"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notifications retrieved successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "Notifications retrieved successfully"
        },
        data: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  feature: { type: "string" },
                  message: { type: "string" },
                  user_id: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" }
                }
              }
            },
            message: { type: "string" },
            count: { type: "number" }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async findAll(@Query() queryDto?: QueryNotificationDto) {
    return this.notificationsService.findAll(queryDto);
  }

  @Get("user/:user_id")
  @ApiOperation({
    summary: "Get notifications for a specific user",
    description: "Retrieves all notifications for a specific user"
  })
  @ApiParam({
    name: "user_id",
    type: String,
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User notifications retrieved successfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async findByUser(
    @Param("user_id", ParseUUIDPipe) user_id: string
  ): Promise<Notification[]> {
    return this.notificationsService.findByUser(user_id);
  }

  @Get("my/notifications")
  @ApiOperation({
    summary: "Get current user notifications",
    description:
      "Retrieves all notifications for the currently authenticated user"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Current user notifications retrieved successfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async getMyNotifications(
    @CurrentUser() user: JwtUser
  ): Promise<Notification[]> {
    return this.notificationsService.findByUser(user.id);
  }

  @Get("recent")
  @ApiOperation({
    summary: "Get recent notifications",
    description: "Retrieves notifications from the last 30 days"
  })
  @ApiQuery({
    name: "user_id",
    required: false,
    type: String,
    description: "Optional user ID to filter recent notifications",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Recent notifications retrieved successfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async getRecentNotifications(
    @Query("user_id") user_id?: string
  ): Promise<Notification[]> {
    return this.notificationsService.getRecentNotifications(user_id);
  }

  @Get("stats/count")
  @ApiOperation({
    summary: "Get notification count for user",
    description:
      "Retrieves the total number of notifications for a specific user"
  })
  @ApiQuery({
    name: "user_id",
    required: true,
    type: String,
    description: "User ID to count notifications for",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification count retrieved successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "Notification count retrieved successfully"
        },
        data: {
          type: "object",
          properties: {
            count: { type: "number", example: 25 },
            user_id: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000"
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
  async getNotificationCount(
    @Query("user_id", ParseUUIDPipe) user_id: string
  ): Promise<{ count: number; user_id: string }> {
    const count = await this.notificationsService.getCountByUser(user_id);
    return { count, user_id };
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get notification by ID",
    description: "Retrieves a specific notification by its ID"
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Notification ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification found successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "Notification retrieved successfully"
        },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            feature: { type: "string" },
            message: { type: "string" },
            user_id: { type: "string" },
            date: { type: "string", format: "date-time" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                firstname: { type: "string" },
                lastname: { type: "string" },
                email: { type: "string" }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification not found"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<Notification | null> {
    return this.notificationsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update notification",
    description: "Updates a notification by ID"
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Notification ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiBody({
    type: UpdateNotificationDto,
    description: "Notification update data",
    examples: {
      message: {
        summary: "Update Message",
        description: "Update notification message",
        value: {
          message:
            "Updated: Your payment has been confirmed and receipt sent to your email."
        }
      },
      feature: {
        summary: "Update Feature",
        description: "Update notification feature",
        value: {
          feature: "system",
          message:
            "System notification: Your account settings have been updated."
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification updated successfully"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification not found"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete notification",
    description: "Deletes a notification by ID"
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Notification ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification deleted successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "Notification deleted successfully"
        },
        data: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Notification has been successfully deleted"
            },
            deletedNotification: {
              type: "object",
              properties: {
                id: { type: "string" },
                message: { type: "string" },
                feature: { type: "string" },
                user_id: { type: "string" },
                created_at: { type: "string", format: "date-time" }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification not found"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async remove(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<{ message: string; deletedNotification: Partial<Notification> }> {
    return this.notificationsService.remove(id);
  }

  @Post("bulk")
  @ApiOperation({
    summary: "Create bulk notifications",
    description: "Creates notifications for multiple users at once"
  })
  @ApiBody({
    type: BulkNotificationDto,
    description: "Bulk notification data",
    examples: {
      system: {
        summary: "System Announcement",
        description: "Send system maintenance notification to multiple users",
        value: {
          user_ids: [
            "550e8400-e29b-41d4-a716-446655440000",
            "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
          ],
          feature: "system",
          message:
            "System maintenance will be performed on December 25th from 2:00 AM to 4:00 AM. Services may be temporarily unavailable."
        }
      },
      promotion: {
        summary: "Promotional Message",
        description: "Send promotional notification to selected users",
        value: {
          user_ids: [
            "550e8400-e29b-41d4-a716-446655440000",
            "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
          ],
          feature: "promotion",
          message:
            "Special offer: Get 20% off on your next event registration! Valid until December 31st."
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Bulk notifications created successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 201 },
        message: {
          type: "string",
          example: "Bulk notifications created successfully"
        },
        data: {
          type: "object",
          properties: {
            created: { type: "number", example: 2 },
            notifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  feature: { type: "string" },
                  message: { type: "string" },
                  user_id: { type: "string" }
                }
              }
            }
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
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async createBulk(
    @Body() bulkNotificationDto: BulkNotificationDto
  ): Promise<{ created: number; notifications: Notification[] }> {
    const notifications = await Promise.all(
      bulkNotificationDto.user_ids.map((user_id) =>
        this.notificationsService.create({
          feature: bulkNotificationDto.feature,
          message: bulkNotificationDto.message,
          user_id
        })
      )
    );

    return {
      created: notifications.length,
      notifications
    };
  }

  @Delete("user/:user_id/all")
  @ApiOperation({
    summary: "Delete all notifications for a user",
    description: "Deletes all notifications for a specific user"
  })
  @ApiParam({
    name: "user_id",
    type: String,
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User notifications deleted successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "User notifications deleted successfully"
        },
        data: {
          type: "object",
          properties: {
            count: { type: "number", example: 5 },
            userId: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000"
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
  async deleteUserNotifications(
    @Param("user_id", ParseUUIDPipe) user_id: string
  ): Promise<{ count: number; user_id: string }> {
    const result = await this.notificationsService.deleteByUser(user_id);
    return { ...result, user_id };
  }

  @Patch("bulk/read")
  @ApiOperation({
    summary: "Mark multiple notifications as read",
    description:
      "Marks multiple notifications as read (for future read status feature)"
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        notificationIds: {
          type: "array",
          items: { type: "string" },
          example: [
            "550e8400-e29b-41d4-a716-446655440000",
            "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
          ]
        }
      },
      required: ["notificationIds"]
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notifications marked as read successfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required"
  })
  async markAsRead(
    @Body("notificationIds") notificationIds: string[]
  ): Promise<{ count: number }> {
    return this.notificationsService.markAsRead(notificationIds);
  }
}
