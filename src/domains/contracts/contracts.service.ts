import { Injectable } from "@nestjs/common";
import { CreateContractDto } from "./dtos/create-contract.dto";
import { UpdateContractDto } from "./dtos/update-contract.dto";
import { DatabaseService } from "src/database/database.service";
import { EventsService } from "src/domains/events/events.service";
import { Prisma, User } from "@prisma/client";
import { QueryContractDto } from "./dtos/query-contract.dto";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { CreateNotificationDto } from "src/domains/notifications/dto/create-notification.dto";
import { CONTRACT_CREATED } from "src/constants";

@Injectable()
export class ContractsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(dto: CreateContractDto, user: User) {
    const contract = await this.db.$transaction(
      async (tx) => {
        // CREATE EVENT
        const event = await this.eventsService.createNewEvent(
          dto.event,
          user,
          tx
        );

        // CREATE CONTRACT
        const contract = tx.contract.create({
          data: {
            client: {
              connectOrCreate: {
                where: { email: dto.client.email },
                create: {
                  ...dto.client,
                  events: { connect: { id: event.id } }
                }
              }
            },
            event: {
              connect: { id: event.id }
            },
            cancellation_policy: { create: dto.cancellation_policy }
          },
          include: { client: true, event: true, cancellation_policy: true }
        });

        // CREATE NOTIFICATION
        const newNotification: CreateNotificationDto = {
          feature: "contract",
          message: `${CONTRACT_CREATED} - ${dto.client.name}`,
          user_id: user.id
        };
        await this.notificationsService.create(newNotification, tx);

        return contract;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );

    return contract;
  }

  /**
   * Filter contracts based on user query
   *
   * @param query
   * @returns
   */
  async findAll(query: QueryContractDto, user: User) {
    const contracts = await this.db.contract.findMany({
      where: { ...query, event: { vendor_id: user.id } },
      include: { client: true }
    });

    return contracts;
  }

  /**
   * Find a contract using the contract id
   *
   * @param {string} id
   * @returns
   */
  async findOne(id: string) {
    const contract = await this.db.contract.findUnique({
      where: { id },
      include: { client: true, event: true, cancellation_policy: true }
    });
    return contract;
  }

  async update(id: string, dto: UpdateContractDto) {
    const contract = await this.db.contract.update({
      where: { id },
      data: dto,
      include: { client: true, event: true, cancellation_policy: true }
    });
    return contract;
  }

  /**
   * Delete a contract using the contract id
   *
   * @param {string} id
   * @returns
   */
  async remove(id: string) {
    const contract = await this.db.contract.delete({
      where: { id }
    });

    return contract;
  }
}
