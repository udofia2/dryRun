import { Injectable } from "@nestjs/common";
import { CreateContractDto } from "./dtos/create-contract.dto";
import { UpdateContractDto } from "./dtos/update-contract.dto";
import { DatabaseService } from "src/database/database.service";
import { EventsService } from "src/events/events.service";
import { Prisma, User } from "@prisma/client";
import { QueryContractDto } from "./dtos/query-contract.dto";

@Injectable()
export class ContractsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: EventsService
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
        return tx.contract.create({
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
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );

    return {
      status: "success",
      message: "Contract created successfully",
      data: contract
    };
  }

  /**
   * Filter contracts based on user query
   *
   * @param query
   * @returns
   */
  async findAll(query: QueryContractDto, user: User) {
    const contracts = await this.db.contract.findMany({
      where: { ...query, event: { exhibitor_id: user.id } },
      include: { client: true }
    });

    return {
      success: true,
      message: "Contracts retrieved successfully",
      data: contracts
    };
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
    return {
      status: "success",
      message: "Contract retrieved successfully",
      data: contract
    };
  }

  async update(id: string, dto: UpdateContractDto) {
    const contract = await this.db.contract.update({
      where: { id },
      data: dto,
      include: { client: true, event: true, cancellation_policy: true }
    });
    return {
      status: "success",
      message: "Contract updated successfully",
      data: contract
    };
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

    return {
      status: "success",
      message: "Contract deleted successfully",
      data: contract
    };
  }
}
