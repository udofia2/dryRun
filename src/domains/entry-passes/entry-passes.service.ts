import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { User } from "@prisma/client";
import { EmailService } from "src/provider/email/email.service";
import { InviteDto } from "src/common/dtos/invite.dto";
import { CreateEntryPassDto } from "./dto/create-entry-pass.dto";
import { QueryEntryPassDto } from "./dto/query-entry-pass.dto";
import { UpdateEntryPassDto } from "./dto/update-entry-pass.dto";
import { createHmac } from "crypto";
import { PaystackWebhookDto } from "./dto/webhook.dto";
import { AddAttendeesDto } from "./dto/add-attendee.dto";

@Injectable()
export class EntryPassService {
  private logger: Logger = new Logger(EntryPassService.name);
  private readonly paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  constructor(
    private readonly emailService: EmailService,
    private readonly db: DatabaseService
  ) {}

  /**
   * Create a new entry pass.
   * @param createEntryPassDto - Data for creating the entry pass.
   * @param user - The authenticated user creating the entry pass.
   * @returns The created entry pass.
   */
  async create(createEntryPassDto: CreateEntryPassDto, user: User) {
    const { invite, event, event_id, ...passData } = createEntryPassDto;

    try {
      let finalEventId = event_id;

      if (finalEventId) {
        const existingEvent = await this.db.event.findUnique({
          where: { id: finalEventId }
        });

        if (!existingEvent) {
          throw new NotFoundException(
            `Event with ID ${finalEventId} not found`
          );
        }
      } else if (event) {
        const eventData = {
          name: event.event_name || "undecided",
          type: event.event_type,
          description: event.event_description,
          event_link: event.event_link,
          location_type: event.location_type || "in_person",
          location_address: "undecided",
          vendor_id: user.id
        };

        const createdEvent = await this.db.event.create({
          data: eventData
        });
        finalEventId = createdEvent.id;
      }

      const createData = {
        ...passData,
        stock_available: passData.stock_limit || 0,
        user: { connect: { id: user.id } },

        ...(finalEventId && {
          event: {
            connect: { id: finalEventId }
          }
        }),

        // Invite creation with all required fields
        invite: {
          create: {
            sender_email: user.email,
            sender_name: invite.sender_email,
            recipients_emails: invite.recipients_emails,
            subject: invite.subject,
            message: invite.message
          }
        }
      };

      const entryPass = await this.db.entryPass.create({
        data: createData,
        include: {
          invite: true,
          attendee: true,
          event: true
        }
      });

      // Send invites if recipients are specified
      if (invite.recipients_emails?.length > 0) {
        await this.sendInvite(entryPass.id, user);
      }

      return entryPass;
    } catch (error) {
      console.error("Error creating entry pass:", error);
      if (error.code === "P2025") {
        throw new NotFoundException("Event not found");
      }
      throw error;
    }
  }

  /**
   * Add attendees to an existing entry pass.
   * @param entryPassId - The ID of the entry pass.
   * @param attendees - The attendees to add.
   * @param user - The authenticated user.
   * @returns The updated entry pass with attendees.
   */
  async addAttendees(
    entryPassId: string,
    attendees: AddAttendeesDto["attendees"],
    user: User
  ) {
    const entryPass = await this.findOne(entryPassId, user);

    const mappedAttendees = attendees.map((detail) => {
      const { user_id, ...attendeeData } = detail;
      return {
        ...attendeeData,
        user: { connect: { id: user.id } }
      };
    });

    return this.db.entryPass.update({
      where: { id: entryPassId },
      data: {
        attendee: {
          create: mappedAttendees
        }
      },
      include: {
        invite: true,
        attendee: true,
        event: true
      }
    });
  }

  // /**
  //  * Retrieve all entry passes with optional filters.
  //  * @param query - Filters and pagination options.
  //  * @param user - The authenticated user.
  //  * @returns A list of entry passes.
  //  */
  async findAll(query: QueryEntryPassDto, user: User) {
    try {
      const { page = 1, limit = 10, ...filters } = query;

      return this.db.entryPass.findMany({
        where: {
          ...filters,
          user_id: user.id
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          invite: true,
          attendee: true,
          event: true
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * Retrieve a specific entry pass by ID.
   * @param id - The ID of the entry pass.
   * @param user - The authenticated user.
   * @returns The entry pass.
   * @throws NotFoundException if the entry pass is not found.
   * @throws UnauthorizedException if the user does not own the entry pass.
   */
  async findOne(id: string, user: User) {
    const entryPass = await this.db.entryPass.findUnique({
      where: { id },
      include: {
        invite: true,
        attendee: true,
        event: true
      }
    });

    if (!entryPass) {
      throw new NotFoundException("Entry pass not found.");
    }

    if (entryPass.user_id !== user.id) {
      throw new UnauthorizedException(
        "You do not have permission to access this entry pass."
      );
    }

    return entryPass;
  }

  // /**
  //  * Update an entry pass by ID.
  //  * @param id - The ID of the entry pass.
  //  * @param updateEntryPassDto - Data for updating the entry pass.
  //  * @param user - The authenticated user.
  //  * @returns The updated entry pass.
  //  * @throws NotFoundException if the entry pass is not found.
  //  * @throws UnauthorizedException if the user does not own the entry pass.
  //  */
  async update(id: string, updateEntryPassDto: UpdateEntryPassDto, user: User) {
    const entryPass = await this.findOne(id, user);
    const { invite, attendee, eventDetails, ...passData } = updateEntryPassDto;

    const updateData: any = {
      ...passData
    };

    if (invite) {
      updateData.invite = {
        upsert: {
          create: invite,
          update: invite
        }
      };
    }

    if (attendee) {
      updateData.attendee = {
        deleteMany: {},
        create: attendee.map((detail) => ({
          ...detail,
          user: { connect: { id: user.id } }
        }))
      };
    }

    if (eventDetails) {
      updateData.event = { update: eventDetails };
    }

    return this.db.entryPass.update({
      where: { id, user_id: user.id },
      data: updateData,
      include: {
        invite: true,
        attendee: true,
        event: true
      }
    });
  }

  /**
   * Delete an entry pass by ID.
   * @param id - The ID of the entry pass.
   * @param user - The authenticated user.
   * @returns The deleted entry pass.
   * @throws NotFoundException if the entry pass is not found.
   * @throws UnauthorizedException if the user does not own the entry pass.
   */
  async remove(id: string, user: User) {
    const entryPass = await this.findOne(id, user);

    return this.db.entryPass.delete({
      where: { id, user_id: user.id }
    });
  }

  /**
   * Send an invite for an entry pass to specified recipients.
   * @param id - The ID of the entry pass.
   * @param recipientsEmails - List of recipient emails.
   * @param user - The authenticated user.
   * @returns A success message.
   * @throws NotFoundException if the entry pass is not found.
   * @throws UnauthorizedException if the user does not own the entry pass.
   */
  async sendInvite(id: string, user: User) {
    try {
      const entryPass = await this.findOne(id, user);

      // Send emails to recipients
      for (const email of entryPass.invite.recipients_emails) {
        await this.emailService.sendEmail(
          email,
          "Invitation to Event",
          `You have been invited to an event. Entry Pass ID: ${entryPass.id}`
        );
      }

      return "Invites sent successfully.";
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getUserPurchaseInfo(entryPassId: string, userId: string) {
    return this.db.userPurchase.findUnique({
      where: {
        user_id_entry_pass_id: {
          user_id: userId,
          entry_pass_id: entryPassId
        }
      },
      select: {
        quantity: true
      }
    });
  }

  verifyPaystackSignature(signature: string, payload: string): boolean {
    const hash = createHmac("sha512", this.paystackSecret)
      .update(payload)
      .digest("hex");
    return hash === signature;
  }

  async handlePaystackWebhook(
    signature: string,
    payload: string,
    webhookData: PaystackWebhookDto
  ) {
    try {
      // Verify webhook signature
      if (!this.verifyPaystackSignature(signature, payload)) {
        throw new UnprocessableEntityException("Invalid signature");
      }

      // Only process successful charges
      if (webhookData.event !== "charge.success") {
        return { status: "skipped", message: "Not a successful charge event" };
      }

      const { entry_pass_id, user_id, quantity } = webhookData.data.metadata;

      // Start a transaction to update multiple records
      return await this.db.$transaction(async (prisma) => {
        // 1. Get the entry pass
        const entryPass = await prisma.entryPass.findUnique({
          where: { id: entry_pass_id }
        });

        if (!entryPass) {
          throw new UnprocessableEntityException("Entry pass not found");
        }

        // 2. Check if stock is available (for limited stock type)
        if (
          entryPass.stock_type === "limited" &&
          entryPass.stock_available < quantity
        ) {
          throw new UnprocessableEntityException("Insufficient stock");
        }

        // 3. Create or update user purchase record
        const userPurchase = await prisma.userPurchase.upsert({
          where: {
            user_id_entry_pass_id: {
              user_id,
              entry_pass_id
            }
          },
          update: {
            quantity: {
              increment: quantity
            }
          },
          create: {
            user_id,
            entry_pass_id,
            quantity
          }
        });

        // 4. Update stock if it's limited
        if (entryPass.stock_type === "limited") {
          await prisma.entryPass.update({
            where: { id: entry_pass_id },
            data: {
              stock_available: {
                decrement: quantity
              }
            }
          });
        }

        // 5. Create a transaction record (optional - if you want to track payments)
        const transaction = await prisma.transaction.create({
          data: {
            amount: webhookData.data.amount / 100, // Paystack amount is in kobo
            reference: webhookData.data.reference,
            status: webhookData.data.status,
            user_id,
            entry_pass_id
          }
        });

        return {
          status: "success",
          message: "Payment processed successfully",
          data: {
            userPurchase,
            transaction
          }
        };
      });
    } catch (error) {
      this.logger.error("Error processing Paystack webhook:", error);
      throw error;
    }
  }
}
