import { Injectable } from "@nestjs/common";
import { CreateInvoiceDto } from "./dto/create-payment.dto";
import { UpdateInvoiceDto } from "./dto/update-payment.dto";
import { DatabaseService } from "src/database/database.service";
import { NotificationsService } from "../notifications/notifications.service";
import { EventsService } from "../events/events.service";
import { Prisma, User } from "@prisma/client";
import { CreateNotificationDto } from "../notifications/dto/create-notification.dto";
import { INVOICE_CREATED } from "src/constants";
import { QueryInvoiceDto } from "./dto/query-invoice.dto";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
    private readonly db: DatabaseService
  ) {}

  async createInvoice(dto: CreateInvoiceDto, user: User) {
    const invoice = await this.db.$transaction(
      async (tx) => {
        // CREATE EVENT
        const event = await this.eventsService.createNewEvent(
          dto.event,
          user,
          tx
        );

        // CREATE INVOICE
        const invoice = tx.invoice.create({
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
            payment_details: { createMany: { data: dto.payment_details } }
          },
          include: { client: true, event: true, payment_details: true }
        });

        this._createNotification(user.id, dto.client.name, tx);

        return invoice;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );

    return invoice;
  }

  private _createNotification(user_id: string, client_name: string, tx: any) {
    // CREATE NOTIFICATION
    const newNotification: CreateNotificationDto = {
      feature: "invoice",
      message: `${INVOICE_CREATED} - ${client_name}`,
      user_id
    };
    this.notificationsService.create(newNotification, tx);
  }

  async findAllUserInvoices(query: QueryInvoiceDto, userId: string) {
    console.log("userId", userId);
    const invoices = await this.db.invoice.findMany({
      where: { ...query, event: { vendor_id: userId } },
      include: { client: true }
    });

    return invoices;
  }

  async findOne(id: string) {
    const invoice = await this.db.invoice.findUnique({
      where: { id },
      include: { client: true, event: true }
    });
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.db.invoice.update({
      where: { id },
      data: dto,
      include: { client: true, event: true }
    });
    return invoice;
  }

  async remove(id: string) {
    const invoice = await this.db.invoice.delete({
      where: { id }
    });

    return invoice;
  }
}
