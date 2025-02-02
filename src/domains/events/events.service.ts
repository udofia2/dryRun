import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto";
import { DatabaseService } from "src/database/database.service";
import { FRONTEND_BASEURL, LOCATIONTYPE } from "src/constants";
import {
  ENTRYPASSTYPE,
  Prisma,
  SCHEDULETYPE,
  STOCKTYPE,
  TICKETTYPE,
  User
} from "@prisma/client";
import { EmailService } from "src/provider/email/email.service";
import { SendEventLinkDto } from "./dto/event.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class EventsService {
  constructor(
    private db: DatabaseService,
    private emailService: EmailService
  ) {}

  async create(dto: CreateEventDto, user: User) {
    try {
      const event = await this.db.$transaction(
        async (tx) => {
          return this.createNewEvent(dto, user, tx);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
          timeout: 30000
        }
      );

      return event;
    } catch (error) {
      console.error("Error creating event:", error);
      throw new ForbiddenException("Error creating event");
    }
  }

  public async createNewEvent(dto: CreateEventDto, user: User, tx: any) {
    try {
      // Check if custom link already exists
      if (dto.link) {
        const existingEvent = await tx.event.findFirst({
          where: { link: dto.link }
        });
        if (existingEvent) {
          throw new ForbiddenException("Custom link already in use");
        }
      }

      let event = await tx.event.create({
        data: {
          name: dto.name,
          link: undefined,
          type: dto.type,
          number_of_guests: dto.number_of_guests,
          description: dto.description ?? undefined,
          city: dto.city ?? undefined,
          state: dto.state ?? undefined,
          location_type:
            LOCATIONTYPE[
              dto.location_type?.toLowerCase().replace(/[\s-]/g, "_")
            ],
          location: dto.location,
          virtual_meeting_link: dto.virtual_meeting_link ?? undefined,
          location_address: dto.location_address ?? undefined,
          schedule_type:
            SCHEDULETYPE[
              dto.schedule_type?.toLowerCase().replace(/[\s-]/g, "_")
            ],
          start_date: new Date(dto.start_date || dto.date),
          start_time: dto.start_time,
          end_date: new Date(dto.end_date || dto.date),
          end_time: dto.end_time,
          recurring_frequency: dto.recurring_frequency ?? undefined,
          facebook_link: dto.facebook_link ?? undefined,
          instagram_link: dto.instagram_link ?? undefined,
          x_link: dto.x_link ?? undefined,
          website_link: dto.website_link ?? undefined,
          cover_art_url: dto.cover_art_url ?? undefined,
          vendor_id: user.id,
          token: "placehoder",
          event_link: "placeholder"
        }
      });

      // CREATE SPECIFICATION
      const specification = await tx.specification.create({
        data: {
          theme: dto.specification.theme,
          event: { connect: { id: event.id } }
        }
      });

      const provisions = dto.specification.provisions.map((provision) => {
        return {
          ...provision,
          start_date: new Date(provision.start_date),
          end_date: new Date(provision.end_date),
          specification_id: specification.id
        };
      });

      const activities = dto.specification.activities.map((activity) => {
        return {
          ...activity,
          start_date: new Date(activity.start_date),
          end_date: new Date(activity.end_date),
          specification_id: specification.id
        };
      });

      await tx.provision.createMany({ data: provisions });
      await tx.activity.createMany({ data: activities });

      // CREATE ENTRY PASSES WITH ATTACHED? INVITE
      const entryPasses = dto.entry_passes?.map((entryPass) => {
        const invitePayload = entryPass.invite ?? undefined;
        return {
          ...entryPass,
          type:
            ENTRYPASSTYPE[
              entryPass.type?.toLowerCase().replace(/[\s-]/g, "_")
            ] ?? undefined,
          stock_type:
            STOCKTYPE[entryPass.stock_type?.toLowerCase()] ?? undefined,
          ticket_type:
            TICKETTYPE[entryPass.ticket_type?.toLowerCase()] ?? undefined,
          event_id: event.id,
          invite: invitePayload && {
            create: {
              ...invitePayload
            }
          }
        };
      });

      if (entryPasses) {
        for (const entryPass of entryPasses) {
          await tx.entryPass.create({
            data: entryPass
          });
        }
      }

      event = await tx.event.findUnique({
        where: { id: event.id },
        include: {
          specification: {
            include: {
              activities: true,
              provisions: true
            }
          },
          entry_passes: {
            include: {
              invite: true
            }
          }
        }
      });

      // unique token and invoice link
      const eventToken = uuidv4();
      const eventLink = `${FRONTEND_BASEURL}/event/${event.id}/${eventToken}`;

      await tx.event.update({
        where: { id: event.id },
        data: {
          event_link: eventLink,
          token: eventToken,
          link: dto.link || eventLink
        }
      });

      return event;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(user: User) {
    const events = await this.db.event.findMany({
      where: { vendor_id: user.id },
      include: {
        specification: {
          include: {
            activities: true,
            provisions: true
          }
        },
        entry_passes: {
          include: {
            invite: true
          }
        }
      }
    });
    return events;
  }

  async findOne(id: string, user: User) {
    const event = await this.db.event.findUnique({
      where: { id, vendor_id: user.id },
      include: {
        specification: {
          include: {
            activities: true,
            provisions: true
          }
        },
        entry_passes: {
          include: {
            invite: true
          }
        }
      }
    });

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, user: User) {
    try {
      const event = await this.db.event.findUnique({
        where: { id, vendor_id: user.id }
      });

      if (!event) {
        throw new ForbiddenException("Event not found");
      }

      const updatedEvent = await this.db.event.update({
        where: { id },
        data: {
          name: updateEventDto.name,
          link: updateEventDto.link,
          type: updateEventDto.type,
          number_of_guests: updateEventDto.number_of_guests,
          description: updateEventDto.description,
          city: updateEventDto.city,
          state: updateEventDto.state,
          location_type:
            LOCATIONTYPE[
              updateEventDto.location_type?.toLowerCase().replace(/[\s-]/g, "_")
            ],
          location: updateEventDto.location,
          virtual_meeting_link: updateEventDto.virtual_meeting_link,
          location_address: updateEventDto.location_address,
          schedule_type:
            SCHEDULETYPE[
              updateEventDto.schedule_type?.toLowerCase().replace(/[\s-]/g, "_")
            ],
          start_date: new Date(updateEventDto.start_date),
          start_time: updateEventDto.start_time,
          end_date: new Date(updateEventDto.end_date),
          end_time: updateEventDto.end_time,
          recurring_frequency: updateEventDto.recurring_frequency,
          facebook_link: updateEventDto.facebook_link,
          instagram_link: updateEventDto.instagram_link,
          x_link: updateEventDto.x_link,
          website_link: updateEventDto.website_link,
          cover_art_url: updateEventDto.cover_art_url
        },
        include: {
          specification: {
            include: {
              activities: true,
              provisions: true
            }
          },
          entry_passes: {
            include: {
              invite: true
            }
          }
        }
      });

      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      throw new ForbiddenException("Error updating event");
    }
  }

  async remove(id: string, user: User) {
    const event = await this.db.event.delete({
      where: { id, vendor_id: user.id }
    });
    if (!event) {
      throw new ForbiddenException("Event not found");
    }
    return event;
  }

  private async sendEventEmail(
    email: string,
    senderName: string,
    eventLink: string
  ) {
    try {
      const data = {
        email_address: email,
        subject: "Your Event is Ready!",
        body: `
          <p>Dear customer,</p>
          <p>You have received a event from ${senderName},</p>
          <p>Click the link below to view and accept/reject your event:</p>
          <a href="${eventLink}" style="background-color: #db5f12; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">View Event</a>        
          <p>Best regards,</p>
          <p>E-vent Team</p>
        `
      };

      await this.emailService.sendEmail(
        data.email_address,
        data.subject,
        data.body
      );
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * FIND ONE Event
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async findEventLink(id: string, user: User) {
    const event = await this.db.event.findUnique({
      where: { id, vendor_id: user.id },
      select: { event_link: true }
    });

    if (!event) {
      throw new UnauthorizedException("Event not found!");
    }

    return event;
  }

  /**
   * FIND CUSTOMIZED Event LINK
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async findCustomizedEventLink(customizedEventLink: string) {
    const event = await this.db.event.findFirst({
      where: { link: customizedEventLink },
      include: {
        client: true,
        specification: { include: { activities: true, provisions: true } },
        entry_passes: { include: { invite: true } },
        vendor: {
          select: { id: true, email: true, firstname: true, lastname: true }
        }
      }
    });

    if (!event) {
      throw new UnauthorizedException("Event not found!");
    }

    return event;
  }

  /**
   * SEND EVENT
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async sendEventLinkByEmail(
    id: string,
    eventDto: SendEventLinkDto,
    user: User
  ) {
    try {
      const event = await this.db.event.findUnique({
        where: { id, vendor_id: user.id }
      });

      if (!event) {
        throw new UnauthorizedException("Event not found!");
      }

      // Send the event link
      await this.sendEventEmail(
        eventDto.email,
        user.firstname,
        event.event_link
      );

      return "Event Sent";
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Method to find an event by ID and token and ensure that the token matches.
   * @param eventId - The ID of the event
   * @param token - The token to verify
   * @returns The event if found and token is valid
   */
  async findEventByIdAndToken(eventId: string, token: string) {
    const event = await this.db.event.findUnique({
      where: { id: eventId },
      include: {
        client: true,
        specification: { include: { activities: true, provisions: true } },
        entry_passes: { include: { invite: true } },
        vendor: {
          select: { id: true, email: true, firstname: true, lastname: true }
        }
      }
    });

    if (!event) {
      throw new UnauthorizedException("Event not found!");
    }

    if (event.token !== token) {
      throw new UnauthorizedException("Invalid token!");
    }

    return event;
  }

  async updateEventStatus(
    eventId: string,
    token: string,
    status: "accepted" | "rejected"
  ) {
    const event = await this.db.event.findUnique({
      where: { id: eventId }
    });

    if (!event || event.token !== token) {
      throw new UnauthorizedException("Invalid event or token");
    }

    return await this.db.event.update({
      where: { id: eventId },
      data: { status }
    });
  }

  async eventPass(eventId: string) {
    try {
      const eventPasses = await this.db.event.findUnique({
        where: {
          id: eventId
        },
        select: { entry_passes: true }
      });

      return eventPasses;
    } catch (error) {
      console.log(error);
    }
  }

  private generateEventLink(eventId: string, token: string): string {
    return `${FRONTEND_BASEURL}/event/${eventId}/${token}`;
  }
}
