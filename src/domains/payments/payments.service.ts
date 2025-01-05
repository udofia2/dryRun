import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateInvoiceDto } from "./dto/create-payment.dto";
import { UpdateInvoiceDto } from "./dto/update-payment.dto";
import { DatabaseService } from "src/database/database.service";
import { NotificationsService } from "../notifications/notifications.service";
import { EventsService } from "../events/events.service";
import { Prisma, User } from "@prisma/client";
import { CreateNotificationDto } from "../notifications/dto/create-notification.dto";
import { CLIENTTYPE, FRONTEND_BASEURL, INVOICE_CREATED } from "src/constants";
import { QueryInvoiceDto } from "./dto/query-invoice.dto";
import { SendInvoiceLinkDto } from "./dto/payment.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class PaymentsService {
  emailService: any;
  constructor(
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
    private readonly db: DatabaseService
  ) {}

  async createInvoice(dto: CreateInvoiceDto, user: User) {
    try {
      const invoice = await this.db.$transaction(
        async (tx) => {
          //generate invoice number
          const invoiceNo = await this.generateInvoiceNumber(tx);

          // CREATE INVOICE
          const invoice = await tx.invoice.create({
            data: {
              // vendor: { connect: { id: user.id } },
              client: {
                connectOrCreate: {
                  where: { email: dto.client.email },
                  create: {
                    ...dto.client,
                    type: CLIENTTYPE[dto.client.type.toLowerCase()],
                    email: dto.client.email,
                    phone_number: dto.client.phone_number
                  }
                }
              },
              payment_details: {
                create: dto.payment_details
              },
              // vendor: user,
              specification: {
                create: {
                  theme: dto.specification.theme,
                  event: {}
                }
              },
              token: "placehoder",
              invoice_link: "placeholder",
              invoice_no: invoiceNo
            },
            include: {
              client: true,
              payment_details: true,
              specification: true
            }
          });

          // CREATE SPECIFICATION
          // const specification = await tx.specification.create({
          //   data: {
          //     theme: dto.specification.theme,
          //     invoice: {
          //       connect: {
          //         id: invoice.id
          //       }
          //     },
          //     event: {}
          //   }
          // });

          const provisions = dto.specification.provisions.map((provision) => {
            return {
              ...provision,
              start_date: new Date(provision.start_date),
              end_date: new Date(provision.end_date),
              specification_id: invoice.specification.id
            };
          });

          const activities = dto.specification.activities.map((activity) => {
            return {
              ...activity,
              start_date: new Date(activity.start_date),
              end_date: new Date(activity.end_date),
              specification_id: invoice.specification.id
            };
          });

          delete provisions[0]["exhibitor_name"];
          delete activities[0]["exhibitor_name"];

          try {
            await tx.provision.createMany({ data: provisions });

            await tx.activity.createMany({ data: activities });
          } catch (error) {
            console.log(error);
          }
          // unique token and invoice link
          const invoiceToken = uuidv4();
          const invoiceLink = `${FRONTEND_BASEURL}/invoice/${invoice.id}/${invoiceToken}`;

          await tx.invoice.update({
            where: { id: invoice.id },
            data: { invoice_link: invoiceLink, token: invoiceToken }
          });

          // this._createNotification(user.id, dto.client.name, tx);

          return invoice;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      );

      return invoice;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  private _createNotification(user_id: string, client_name: string, tx: any) {
    try {
      // CREATE NOTIFICATION
      const newNotification: CreateNotificationDto = {
        feature: "invoice",
        message: `${INVOICE_CREATED} - ${client_name}`,
        user_id
      };
      this.notificationsService.create(newNotification, tx);
    } catch (error) {}
  }

  async findAllUserInvoices(query: QueryInvoiceDto, userId: string) {
    try {
      const invoices = await this.db.invoice.findMany({
        // where: { ...query, vendor: { id: userId } },
        include: {
          client: true,
          specification: { include: { activities: true, provisions: true } },
          payment_details: true
        }
      });

      return invoices;
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string) {
    const invoice = await this.db.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        specification: {
          include: {
            activities: true,
            provisions: true
          }
        },
        vendor: true,
        payment_details: true
      }
    });
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.db.invoice.update({
      where: { id },
      data: dto,
      include: { client: true }
    });
    return invoice;
  }

  async remove(id: string) {
    const invoice = await this.db.invoice.delete({
      where: { id }
    });

    return invoice;
  }

  private async sendInvoiceEmail(
    email: string,
    senderName: string,
    invoiceLink: string
  ) {
    const data = {
      email_address: email,
      subject: "Your Invoice is Ready!",
      body: `
        <p>Dear customer,</p>
        <p>You have received a invoice from ${senderName},</p>
        <p>Click the link below to view and accept/reject your invoice:</p>
        <a href="${invoiceLink}" style="background-color: #db5f12; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">View Invoice</a>        
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
   * FIND ONE Invoice
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async findInvoiceLink(id: string, user: User) {
    const invoice = await this.db.invoice.findUnique({
      where: { id, vendor_id: user.id },
      select: { invoice_link: true }
    });

    if (!invoice) {
      throw new UnauthorizedException("Invoice not found!");
    }

    return invoice;
  }

  /**
   * SEND INVOICE
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async sendInvoiceLinkByEmail(
    id: string,
    invoiceDto: SendInvoiceLinkDto,
    user: User
  ) {
    const invoice = await this.db.invoice.findUnique({
      where: { id, vendor_id: user.id },
      include: {
        // event: {
        //   include: {
        //     client: true,
        //     specification: { include: { activities: true, provisions: true } }
        //   }
        // }
      }
    });

    if (!invoice) {
      throw new UnauthorizedException("Invoice not found!");
    }

    // Send the invoice link
    await this.sendInvoiceEmail(
      invoiceDto.email,
      user.firstname,
      invoice.invoice_link
    );

    return "Invoice Sent";
  }

  /**
   * Method to find an invoice by ID and token and ensure that the token matches.
   * @param invoiceId - The ID of the invoice
   * @param token - The token to verify
   * @returns The invoice if found and token is valid
   */
  async findInvoiceByIdAndToken(invoiceId: string, token: string) {
    const invoice = await this.db.invoice.findUnique({
      where: { id: invoiceId }
      // include: {
      //   event: {
      //     include: {
      //       client: true,
      //       specification: true
      //     }
      //   }
      // }
    });

    if (!invoice) {
      throw new UnauthorizedException("Invoice not found!");
    }

    if (invoice.token !== token) {
      throw new UnauthorizedException("Invalid token!");
    }

    return invoice;
  }

  async updateInvoiceStatus(
    invoiceId: string,
    token: string,
    status: "accepted" | "rejected"
  ) {
    const invoice = await this.db.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice || invoice.token !== token) {
      throw new UnauthorizedException("Invalid invoice or token");
    }

    return await this.db.invoice.update({
      where: { id: invoiceId },
      data: { status }
    });
  }

  async generateInvoiceNumber(tx: any) {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Get the count of invoices for the current year
    const invoiceCount = await tx.invoice.count({
      where: {
        created_at: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1)
        }
      }
    });

    // Generate invoice number (e.g., INV-2025-0001)
    const paddedNumber = (invoiceCount + 1).toString().padStart(4, "0");
    return `INV-${currentYear}-${paddedNumber}`;
  }
}
