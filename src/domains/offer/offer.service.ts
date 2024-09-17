import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateOfferDto } from "./dto";
import { DatabaseService } from "src/database/database.service";
import {
  CLIENTTYPE,
  LOCATIONTYPE,
  OFFER_ACCEPTED,
  OFFER_CREATED,
  STATUSTYPE
} from "src/constants";
import { PAYMENTSTRUCTURE, User } from "@prisma/client";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { CreateNotificationDto } from "src/domains/notifications/dto/create-notification.dto";
import { NotificationsService } from "src/domains/notifications/notifications.service";

@Injectable()
export class OfferService {
  constructor(
    private db: DatabaseService,
    private readonly notificationsService: NotificationsService
  ) {}

  /**
   * CREATE STANDALONE OFFER
   * @param {CreateOfferDto} dto
   * @param {User} user
   * @returns
   */
  async create(dto: CreateOfferDto, user: User) {
    return this.db.$transaction(async (tx) => {
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

      const offer = await tx.offer.create({
        data: {
          vendor: { connect: { id: user.id } },
          payment_structure: {
            create: {
              structure:
                PAYMENTSTRUCTURE[
                  dto.payment_structure.structure
                    .toLowerCase()
                    .replace(/[\s-]/g, "_")
                ],
              initial_deposit: dto.payment_structure.initial_deposit ?? false,
              initial_deposit_amount:
                dto.payment_structure.initial_deposit_amount
            }
          },
          event: { connect: { id: event.id } }
        },
        include: {
          event: {
            include: {
              client: true
            }
          },
          payment_structure: true
        }
      });

      // CREATE NOTIFICATION
      const newNotification: CreateNotificationDto = {
        feature: "offer",
        message: `${OFFER_CREATED} - ${offer.event.client.name}`,
        user_id: user.id
      };
      await this.notificationsService.create(newNotification, tx);

      return offer;
    });
  }

  /**
   * FILTER BY STATUS
   * @param status
   * @param {User} user
   * @returns
   */
  async filter(status: string, user: User) {
    const offers = await this.db.offer.findMany({
      where: {
        status: STATUSTYPE[status.toLowerCase()],
        vendor_id: user.id
      }
    });

    return offers;
  }

  /**
   * FIND ALL vendor'S OFFERS
   * @param {User} user
   * @returns
   */
  async findAll(user: User) {
    const offers = await this.db.offer.findMany({
      where: { vendor_id: user.id },
      include: { event: { include: { client: true } } }
    });

    return offers;
  }

  /**
   * FIND ONE OFFER
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async findById(id: string, user: User) {
    const offer = await this.db.offer.findUnique({
      where: { id, vendor_id: user.id }
    });

    return offer;
  }

  /**
   * UPDATE OFFER FIELDS
   *
   * @param {string} id
   * @param {UpdateOfferDto} dto
   * @param {User} user
   * @returns
   */
  async update(id: string, dto: UpdateOfferDto, user: User) {
    const offer = await this.db.offer.update({
      where: { id },
      data: dto,
      include: { event: { include: { client: true } } }
    });

    if (offer) {
      if (offer.vendor_id !== user.id) {
        throw new UnauthorizedException("Unauthorized access to offer!");
      }
    }

    // UPDATE NOTIFICATION
    await this.db.notification.create({
      data: {
        feature: "offer",
        message: `${OFFER_ACCEPTED} - ${offer.event.client.name}`,
        user_id: user.id
      }
    });

    return offer;
  }

  /**
   * DELETE offer
   * @param {string} id - The id of the offer to delete
   * @param {User} user
   * @returns
   */
  async delete(id: string, user: User) {
    const offer = await this.db.offer.findUnique({
      where: { id }
    });

    if (offer) {
      if (offer.vendor_id !== user.id) {
        throw new UnauthorizedException("Unauthorized!");
      }
    }

    await this.db.offer.delete({
      where: { id }
    });

    return offer;
  }
}
