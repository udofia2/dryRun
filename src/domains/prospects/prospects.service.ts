import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateProspectDto } from "./dto/prospects.dto";
import { DatabaseService } from "src/database/database.service";
import {
  CLIENTTYPE,
  LOCATIONTYPE,
  PROSPECT_CONVERSION,
  PROSPECT_CREATED
} from "src/constants";
import { UpdateProspectsDto } from "./dto/update-prospects.dto";
import { EVENTSOURCE, User } from "@prisma/client";
import { CreateNotificationDto } from "src/domains/notifications/dto/create-notification.dto";
import { NotificationsService } from "src/domains/notifications/notifications.service";

@Injectable()
export class ProspectsService {
  constructor(
    private db: DatabaseService,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(dto: CreateProspectDto, user: User) {
    return this.db.$transaction(async (tx) => {
      const { source } = dto;

      // CREATE PROSPECT
      let prospect = await tx.prospect.create({
        data: {
          source: EVENTSOURCE[source.toLowerCase()],
          vendor: { connect: { id: user.id } },
          client: {
            connectOrCreate: {
              where: { email: dto.client.email },
              create: {
                name: dto.client.name,
                type: CLIENTTYPE[dto.client.type.toLowerCase()],
                email: dto.client.email,
                phone_number: dto.client.phone_number
              }
            }
          }
        }
      });

      // CREATE EVENT
      const event = await tx.event.create({
        data: {
          name: dto.event.name,
          date: new Date(dto.event.date),
          type: dto.event.type,
          description: dto.event.description ?? undefined,
          city: dto.event.city ?? undefined,
          state: dto.event.state ?? undefined,
          location_type:
            LOCATIONTYPE[
              dto.event.location_type.toLowerCase().replace(/[\s-]/g, "_")
            ],
          location_address: dto.event.location_address ?? undefined,
          vendor_id: user.id,
          client_email: dto.client.email,
          prospect_id: prospect.id
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

      // CREATE NOTIFICATION
      const newNotification: CreateNotificationDto = {
        feature: "prospect",
        message: `${PROSPECT_CREATED} - ${dto.client.name}`,
        user_id: user.id
      };
      await this.notificationsService.create(newNotification, tx);

      prospect = await tx.prospect.findUnique({
        where: { id: prospect.id },
        include: {
          client: true,
          event: {
            include: {
              specification: {
                include: {
                  activities: true,
                  provisions: true
                }
              }
            }
          }
        }
      });

      return prospect;
    });
  }

  /**
   * FIND ALL PROSPECTS
   * @param {User} user - The user making the request
   * @returns
   */
  async findAll(user: User) {
    const prospects = await this.db.prospect.findMany({
      where: { vendor_id: user.id },
      include: {
        client: true
      }
    });
    return prospects;
  }

  /**
   * Find a prospect by id
   * @param {string} id - The id of the prospect to find
   * @param {User} user - The user making the request
   * @returns
   */
  async findOne(id: string, user: User) {
    const prospect = await this.db.prospect.findUnique({
      where: { id, vendor_id: user.id },
      include: {
        client: true,
        event: {
          include: {
            specification: {
              include: {
                activities: true,
                provisions: true
              }
            }
          }
        }
      }
    });

    return prospect;
  }

  async filter(source: string) {
    const prospects = await this.db.prospect.findMany({
      where: { source: EVENTSOURCE[source.toLowerCase()] }
    });

    return prospects;
  }

  /**
   * UPDATE PROSPECT FIELDS
   * @param {string} id - The id of the prospect to update
   * @param {UpdateProspectsDto} dto - The updated prospects field(s)
   * @param {User} user - The user making the request
   * @returns
   */
  async update(id: string, dto: UpdateProspectsDto, user: User) {
    const prospect = await this.db.prospect.update({
      where: { id },
      data: dto,
      include: { client: true }
    });

    if (prospect) {
      if (prospect.vendor_id !== user.id) {
        throw new UnauthorizedException("Unauthorized!");
      }
    }

    // create notification
    await this.db.notification.create({
      data: {
        feature: "prospect",
        message: `${PROSPECT_CONVERSION} - ${prospect.client.name}`,
        user_id: user.id
      }
    });

    return prospect;
  }

  /**
   * DELETE PROSPECT
   * @param {string} id - The id of the prospect to delete
   * @param {User} user
   * @returns
   */
  async delete(id: string, user: User) {
    const prospect = await this.db.prospect.findUnique({
      where: { id }
    });

    if (prospect) {
      if (prospect.vendor_id !== user.id) {
        throw new UnauthorizedException("Unauthorized!");
      }
    }

    await this.db.prospect.delete({
      where: { id }
    });

    return prospect;
  }
}
