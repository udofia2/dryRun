import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateContractDto } from "./dtos/create-contract.dto";
import { UpdateContractDto } from "./dtos/update-contract.dto";
import { DatabaseService } from "src/database/database.service";
import { EventsService } from "src/domains/events/events.service";
import { Prisma, User } from "@prisma/client";
import { QueryContractDto } from "./dtos/query-contract.dto";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { CreateNotificationDto } from "src/domains/notifications/dto/create-notification.dto";
import { CONTRACT_CREATED, FRONTEND_BASEURL } from "src/constants";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "src/provider/email/email.service";

@Injectable()
export class ContractsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService
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
        const contract = await tx.contract.create({
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
            cancellation_policy: { create: dto.cancellation_policy },
            payment_details: { createMany: { data: dto.payment_details } },
            vendor: { connect: { id: user.id } },
            invoice: { create: { client_email: dto.client.email } },
            token: "placehoder",
            contract_link: "placeholder"
          },
          include: { client: true, event: true, cancellation_policy: true }
        });

        // unique token and contract link
        const contractToken = uuidv4();
        const contractLink = `${FRONTEND_BASEURL}/contract/${contract.id}/${contractToken}`;

        await tx.contract.update({
          where: { id: contract.id },
          data: { contract_link: contractLink, token: contractToken }
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
      include: {
        client: true,
        event: true,
        cancellation_policy: true,
        invoice: true
      }
    });
    return contract;
  }

  async update(id: string, dto: UpdateContractDto) {
    const contract = await this.db.contract.update({
      where: { id },
      data: dto,
      include: {
        client: true,
        event: true,
        cancellation_policy: true,
        invoice: true
      }
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

  private async sendContractLinkViaEmail(
    email: string,
    senderName: string,
    contractLink: string
  ) {
    const data = {
      email_address: email,
      subject: "Your Contract is Ready!",
      body: `
        <p>Dear customer,</p>
        <p>You have received a contract from ${senderName},</p>
        <p>Click the link below to view and accept/reject your contract:</p>
        <a href="${contractLink}" style="background-color: #db5f12; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">View Contract</a>        
        <p>Best regards,</p>
        <p>E-vent Team</p>
      `
    };

    await this.emailService.sendEmail(
      data.email_address,
      data.subject,
      data.body
    );
  }

  /**
   * FIND ONE Contract
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async findContractLink(id: string, user: User) {
    const contract = await this.db.contract.findUnique({
      where: { id, vendor_id: user.id },
      select: { contract_link: true }
    });

    if (!contract) {
      throw new UnauthorizedException("Contract not found!");
    }

    return contract;
  }

  /**
   * SEND CONTRACT
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async sendContractLinkByEmail(id: string, user: User) {
    const contract = await this.db.contract.findUnique({
      where: { id, vendor_id: user.id },
      include: {
        event: {
          include: {
            client: true,
            specification: { include: { activities: true, provisions: true } }
          }
        }
      }
    });

    if (!contract) {
      throw new UnauthorizedException("Contract not found!");
    }

    // Send the contract link
    await this.sendContractLinkViaEmail(
      contract.event.client.email,
      user.firstname,
      contract.contract_link
    );

    return "Contract Sent";
  }

  /**
   * Method to find an contract by ID and token and ensure that the token matches.
   * @param contractId - The ID of the contract
   * @param token - The token to verify
   * @param user - The authenticated user (vendor)
   * @returns The contract if found and token is valid
   */
  async findContractByIdAndToken(
    contractId: string,
    token: string,
    user: User
  ) {
    const contract = await this.db.contract.findUnique({
      where: { id: contractId },
      include: {
        event: {
          include: {
            client: true
          }
        }
      }
    });

    if (!contract) {
      throw new UnauthorizedException("Contract not found!");
    }

    if (contract.token !== token) {
      throw new UnauthorizedException("Invalid token!");
    }

    if (contract.vendor_id !== user.id) {
      throw new UnauthorizedException(
        "You are not authorized to view this contract!"
      );
    }

    return contract;
  }

  async updateContractStatus(
    contractId: string,
    token: string,
    status: "accepted" | "rejected"
  ) {
    const contract = await this.db.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract || contract.token !== token) {
      throw new UnauthorizedException("Invalid constract or token");
    }

    return await this.db.contract.update({
      where: { id: contractId },
      data: { status }
    });
  }
}
