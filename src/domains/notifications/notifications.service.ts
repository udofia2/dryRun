import { Injectable, Logger } from "@nestjs/common";
import {
  CreateNotificationDto,
  QueryNotificationDto
} from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { DatabaseService } from "src/database/database.service";
import { Notification } from "@prisma/client";
import { EmailService } from "src/provider/email/email.service";
import {
  NOTIFICATIONTYPE,
  SendNotificationDto
} from "./dto/send-notification.dto";
import { SmsService } from "src/provider/sms/sms.service";
import { PushService } from "src/provider/push/push.service";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly emailService: EmailService,
    private readonly smsService?: SmsService,
    private readonly pushService?: PushService
  ) {}

  /**
   * Creates a new notification
   * @param {CreateNotificationDto} dto - notification data (pre-validated by class-validator)
   * @param {any} tx - optional transaction object
   * @returns {Promise<Notification>} - the newly created notification
   */
  async create(dto: CreateNotificationDto, tx?: any): Promise<Notification> {
    try {
      this.logger.log(
        `Attempting to create notification for user: ${dto.user_id}`
      );

      const prismatx = tx || this.db;
      const notification = await prismatx.notification.create({
        data: {
          ...dto
        },
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
      });

      this.logger.log(
        `Successfully created notification with ID: ${notification.id} for user: ${dto.user_id}`
      );
      return notification;
    } catch (error) {
      this.logger.error(
        `Failed to create notification for user: ${dto.user_id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Finds all notifications with optional filtering
   * @param {string} userId - optional user ID to filter notifications
   * @returns {Promise<{ success: boolean; data: Notification[]; message: string; count: number }>}
   */
  async findAll(queryDto?: QueryNotificationDto): Promise<{
    success: boolean;
    data: Notification[];
    message: string;
    count: number;
  }> {
    try {
      this.logger.log(
        `Fetching all notifications${queryDto.user_id ? ` for user: ${queryDto.user_id}` : ""}`
      );
      this.logger.log(
        `Fetching notifications with filters: ${JSON.stringify(queryDto)}`
      );

      const whereClause: any = {};

      if (queryDto?.user_id) {
        whereClause.user_id = queryDto.user_id;
      }

      if (queryDto?.feature) {
        whereClause.feature = queryDto.feature;
      }

      if (queryDto?.search) {
        whereClause.message = {
          contains: queryDto.search,
          mode: "insensitive"
        };
      }

      if (queryDto?.startDate || queryDto?.endDate) {
        whereClause.created_at = {};
        if (queryDto.startDate) {
          whereClause.created_at.gte = new Date(queryDto.startDate);
        }
        if (queryDto.endDate) {
          whereClause.created_at.lte = new Date(queryDto.endDate);
        }
      }

      const notifications = await this.db.notification.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: "desc"
        },
        skip: queryDto?.offset || 0,
        take: queryDto?.limit || 20
      });

      this.logger.log(
        `Successfully fetched ${notifications.length} notifications`
      );

      return {
        success: true,
        data: notifications,
        message: queryDto.user_id
          ? `Notifications for user ${queryDto.user_id}`
          : "All notifications",
        count: notifications.length
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch notifications${queryDto.user_id ? ` for user: ${queryDto.user_id}` : ""}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Finds a single notification by ID
   * @param {string} id - the notification ID
   * @returns {Promise<Notification | null>} - the notification or null if not found
   */
  async findOne(id: string): Promise<Notification | null> {
    try {
      this.logger.log(`Fetching notification with ID: ${id}`);

      const notification = await this.db.notification.findUnique({
        where: { id },
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
      });

      if (notification) {
        this.logger.log(`Successfully found notification with ID: ${id}`);
      } else {
        this.logger.log(`Notification with ID: ${id} not found`);
      }

      return notification;
    } catch (error) {
      this.logger.error(
        `Failed to find notification with ID: ${id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Updates a notification by ID
   * @param {string} id - the notification ID
   * @param {UpdateNotificationDto} updateNotificationDto - the data to update
   * @returns {Promise<Notification>} - the updated notification
   */
  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    try {
      this.logger.log(`Attempting to update notification with ID: ${id}`);

      // Check if notification exists first
      const existingNotification = await this.db.notification.findUnique({
        where: { id }
      });

      if (!existingNotification) {
        this.logger.error(`Notification with ID: ${id} not found for update`);
        throw new Error(`Notification with ID ${id} not found`);
      }

      const updatedNotification = await this.db.notification.update({
        where: { id },
        data: updateNotificationDto,
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
      });

      this.logger.log(`Successfully updated notification with ID: ${id}`);
      return updatedNotification;
    } catch (error) {
      this.logger.error(
        `Failed to update notification with ID: ${id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Deletes a notification by ID
   * @param {string} id - the notification ID
   * @returns {Promise<{ message: string; deletedNotification: Partial<Notification> }>}
   */
  async remove(id: string): Promise<{
    message: string;
    deletedNotification: Partial<Notification>;
  }> {
    try {
      this.logger.log(`Attempting to delete notification with ID: ${id}`);

      // Check if notification exists first
      const existingNotification = await this.db.notification.findUnique({
        where: { id },
        select: {
          id: true,
          message: true,
          feature: true,
          user_id: true,
          created_at: true
        }
      });

      if (!existingNotification) {
        this.logger.error(`Notification with ID: ${id} not found for deletion`);
        throw new Error(`Notification with ID ${id} not found`);
      }

      // Hard delete the notification
      await this.db.notification.delete({
        where: { id }
      });

      this.logger.log(`Successfully deleted notification with ID: ${id}`);

      return {
        message: `Notification has been successfully deleted`,
        deletedNotification: existingNotification
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete notification with ID: ${id}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Finds all notifications for a specific user
   * @param {string} userId - the user ID
   * @returns {Promise<Notification[]>} - array of user notifications
   */
  async findByUser(userId: string): Promise<Notification[]> {
    try {
      this.logger.log(`Fetching notifications for user: ${userId}`);

      const notifications = await this.db.notification.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: "desc"
        }
      });

      this.logger.log(
        `Successfully fetched ${notifications.length} notifications for user: ${userId}`
      );
      return notifications;
    } catch (error) {
      this.logger.error(
        `Failed to fetch notifications for user: ${userId}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Marks notifications as read (if you add a read field later)
   * @param {string[]} notificationIds - array of notification IDs
   * @returns {Promise<{ count: number }>} - count of updated notifications
   */
  async markAsRead(notificationIds: string[]): Promise<{ count: number }> {
    try {
      this.logger.log(
        `Marking ${notificationIds.length} notifications as read`
      );

      // This assumes you might add a 'read' field to your schema later
      const result = await this.db.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          }
        },
        data: {
          // read: true, // Uncomment when you add this field
          updated_at: new Date()
        }
      });

      this.logger.log(
        `Successfully marked ${result.count} notifications as read`
      );
      return { count: result.count };
    } catch (error) {
      this.logger.error(
        `Failed to mark notifications as read`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Get notification count for a user
   * @param {string} userId - the user ID
   * @returns {Promise<number>} - count of notifications
   */
  async getCountByUser(userId: string): Promise<number> {
    try {
      const count = await this.db.notification.count({
        where: { user_id: userId }
      });

      this.logger.log(`User ${userId} has ${count} notifications`);
      return count;
    } catch (error) {
      this.logger.error(
        `Failed to get notification count for user: ${userId}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   * @param {string} userId - the user ID
   * @returns {Promise<{ count: number }>} - count of deleted notifications
   */
  async deleteByUser(userId: string): Promise<{ count: number }> {
    try {
      this.logger.log(`Deleting all notifications for user: ${userId}`);

      const result = await this.db.notification.deleteMany({
        where: { user_id: userId }
      });

      this.logger.log(
        `Successfully deleted ${result.count} notifications for user: ${userId}`
      );
      return { count: result.count };
    } catch (error) {
      this.logger.error(
        `Failed to delete notifications for user: ${userId}`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Get recent notifications (last 30 days)
   * @param {string} userId - optional user ID to filter
   * @returns {Promise<Notification[]>} - recent notifications
   */
  async getRecentNotifications(userId?: string): Promise<Notification[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      this.logger.log(
        `Fetching recent notifications${userId ? ` for user: ${userId}` : ""}`
      );

      const whereClause = {
        created_at: {
          gte: thirtyDaysAgo
        },
        ...(userId && { user_id: userId })
      };

      const notifications = await this.db.notification.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: "desc"
        },
        take: 50 // Limit to 50 recent notifications
      });

      this.logger.log(
        `Successfully fetched ${notifications.length} recent notifications`
      );
      return notifications;
    } catch (error) {
      this.logger.error(
        `Failed to fetch recent notifications`,
        error instanceof Error ? error.stack : "Unknown error"
      );
      throw error;
    }
  }

  async send(notification: SendNotificationDto) {
    try {
      this.logger.log(
        `Sending ${notification.type} notification to user: ${notification.userId}`
      );

      // 1. Always save to DB for in-app notifications
      const dbNotification = await this.storeInApp(notification);

      // 2. Send push notification if applicable
      if (this.shouldSendPush(notification)) {
        await this.sendPushNotification(notification);
      }

      // 3. Send email if applicable
      if (this.shouldSendEmail(notification)) {
        await this.sendEmailNotification(notification);
      }

      // 4. Send SMS for critical notifications
      if (
        notification.type === NOTIFICATIONTYPE.CRITICAL &&
        notification.userPhone
      ) {
        await this.sendSmsNotification(notification);
      }

      this.logger.log(
        `Successfully sent notification to user: ${notification.userId}`
      );
      return dbNotification;
    } catch (error) {
      this.logger.error(`Failed to send notification`, error);
      throw error;
    }
  }

  private async storeInApp(
    notification: SendNotificationDto
  ): Promise<Notification> {
    return await this.db.notification.create({
      data: {
        user_id: notification.userId,
        feature: notification.feature,
        message: notification.message,
        type: notification.type,
        read: false
      },
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
    });
  }

  private async sendPushNotification(
    notification: SendNotificationDto
  ): Promise<void> {
    if (!this.pushService) return;

    try {
      await this.pushService.send({
        userId: notification.userId,
        title: notification.feature,
        body: notification.message,
        deviceToken: notification.deviceToken
      });
    } catch (error) {
      this.logger.error(
        `Push notification failed for user: ${notification.userId}`,
        error
      );
      // Don't throw - push failure shouldn't break the entire flow
    }
  }

  private async sendEmailNotification(
    notification: SendNotificationDto
  ): Promise<void> {
    try {
      await this.emailService.sendEmail(
        notification.userEmail,
        `${notification.feature.replace("_", " ").toUpperCase()} Notification`,
        notification.message,
        notification.type
      );
    } catch (error) {
      this.logger.error(
        `Email notification failed for user: ${notification.userId}`,
        error
      );
      // Don't throw - email failure shouldn't break the entire flow
    }
  }

  private async sendSmsNotification(
    notification: SendNotificationDto
  ): Promise<void> {
    if (!this.smsService || !notification.userPhone) return;

    try {
      await this.smsService.send(notification.userPhone, notification.message);
    } catch (error) {
      this.logger.error(
        `SMS notification failed for user: ${notification.userId}`,
        error
      );
      // Don't throw - SMS failure shouldn't break the entire flow
    }
  }

  private shouldSendPush(notification: SendNotificationDto): boolean {
    return !!notification.deviceToken && this.pushService !== undefined;
  }

  private shouldSendEmail(notification: SendNotificationDto): boolean {
    return (
      notification.type !== NOTIFICATIONTYPE.INFO && !!notification.userEmail
    );
  }
}
