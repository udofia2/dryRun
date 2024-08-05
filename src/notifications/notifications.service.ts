import { Injectable } from "@nestjs/common";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}
  create(createNotificationDto: CreateNotificationDto) {
    return "This action adds a new notification";
  }

  async findAll() {
    const notifications = await this.db.notification.findMany();
    return {
      success: true,
      data: notifications,
      message: "All notifications"
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
