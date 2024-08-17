import { Injectable } from "@nestjs/common";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}
  async create(dto: CreateNotificationDto, tx?: any) {
    const prismatx = tx || this.db;
    return await prismatx.notification.create({
      data: {
        ...dto
      }
    });
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

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
