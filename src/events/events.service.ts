import { Injectable } from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto";
import { DatabaseService } from "src/database/database.service";
import { LOCATIONTYPE } from "src/constants";
import {
  ENTRYPASSTYPE,
  Prisma,
  SCHEDULETYPE,
  STOCKTYPE,
  TICKETTYPE
} from "@prisma/client";

@Injectable()
export class EventsService {
  constructor(private db: DatabaseService) {}

  async create(dto: CreateEventDto, req: any) {
    return this.db.$transaction(
      async (tx) => {
        let event = await tx.event.create({
          data: {
            name: dto.name,
            link: dto.link,
            description: dto.description ?? undefined,
            city: dto.city ?? undefined,
            state: dto.state ?? undefined,
            location_type:
              LOCATIONTYPE[
                dto.location_type.toLowerCase().replace(/[\s-]/g, "_")
              ],
            virtual_meeting_link: dto.virtual_meeting_link ?? undefined,
            location_address: dto.location_address ?? undefined,
            schedule_type:
              SCHEDULETYPE[
                dto.schedule_type.toLowerCase().replace(/[\s-]/g, "_")
              ],
            start_date: new Date(dto.start_date),
            start_time: dto.start_time,
            end_date: new Date(dto.end_date),
            end_time: dto.end_time,
            recurring_frequency: dto.recurring_frequency ?? undefined,
            facebook_link: dto.facebook_link ?? undefined,
            instagram_link: dto.instagram_link ?? undefined,
            x_link: dto.x_link ?? undefined,
            website_link: dto.website_link ?? undefined,
            cover_art_url: dto.cover_art_url ?? undefined,
            exhibitor_id: req.user.id
          }
        });

        // CREATE SPECIFICATION
        const specification = await tx.specification.create({
          data: {
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
        const entryPasses = dto.entry_passes.map((entryPass) => {
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

        for (const entryPass of entryPasses) {
          await tx.entryPass.create({
            data: entryPass
          });
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

        return {
          status: "success",
          message: "Event created successfully",
          data: event
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }

  async findAll(req: any) {
    const events = await this.db.event.findMany({
      where: { exhibitor_id: req.user.id }
    });
    return {
      success: true,
      message: "Events retrieved successfully",
      data: events
    };
  }

  async findOne(id: string, req: any) {
    const event = await this.db.event.findUnique({
      where: { id, exhibitor_id: req.user.id },
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

    return {
      success: true,
      message: "Event retrieved successfully",
      data: event
    };
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
