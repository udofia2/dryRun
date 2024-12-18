import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateOfferDto, SendOfferLinkDto } from "./dto";
import { DatabaseService } from "src/database/database.service";
import {
  CLIENTTYPE,
  LOCATIONTYPE,
  OFFER_ACCEPTED,
  OFFER_CREATED,
  FRONTEND_BASEURL,
  STATUSTYPE
} from "src/constants";
import { PAYMENTSTRUCTURE, User } from "@prisma/client";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { CreateNotificationDto } from "src/domains/notifications/dto/create-notification.dto";
import { NotificationsService } from "src/domains/notifications/notifications.service";
import { TERMII_API_KEY, TERMII_EMAIL_ID } from "../../constants";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "src/provider/email/email.service";

@Injectable()
export class OfferService {
  constructor(
    private db: DatabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService
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

      delete provisions[0]["exhibitor_name"];
      delete activities[0]["exhibitor_name"];

      try {
        await tx.provision.createMany({ data: provisions });

        await tx.activity.createMany({ data: activities });
      } catch (error) {
        console.log(error);
      }

      // unique token and offer link
      const offerToken = uuidv4();

      const offer = await tx.offer.create({
        data: {
          vendor: { connect: { id: user.id } },
          // client_email: dto.client.email,
          token: offerToken,
          offer_link: "temp",
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

      const offerLink = `${FRONTEND_BASEURL}/home/view-offers/${offer.id}/${offerToken}`;

      await tx.offer.update({
        where: { id: offer.id },
        data: { offer_link: offerLink }
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
      },
      include: { event: { include: { client: true } } }
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
      include: {
        event: {
          include: {
            client: true,
            specification: { include: { activities: true, provisions: true } }
          }
        }
      }
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

    if (!offer) {
      throw new UnauthorizedException("Offer not found!");
    }

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
      include: {
        event: {
          include: {
            client: true,
            vendor: true,
            specification: { include: { activities: true, provisions: true } },
            prospect: true,
            entry_passes: true,
            contract: true
          }
        }
      }
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

  private async sendOfferEmail(
    email: string,
    senderName: string,
    offerLink: string
  ) {
    const data = {
      api_key: TERMII_API_KEY,
      email_address: email,
      email_configuration_id: TERMII_EMAIL_ID,
      subject: "Your Offer is Ready!",
      body: `
        <p>Dear customer,</p>
        <p>You have received offer from ${senderName},</p>
        <p>Click the link below to view and accept/reject your offer:</p>
        <a href="${offerLink}" style="background-color: #db5f12; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">View Offer</a>        
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
   * FIND ONE OFFER
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async findOfferLink(id: string, user: User) {
    const offer = await this.db.offer.findUnique({
      where: { id, vendor_id: user.id },
      select: { offer_link: true }
    });

    if (!offer) {
      throw new UnauthorizedException("Offer not found!");
    }

    return offer;
  }

  /**
   * SEND OFFER
   * @param {string} id
   * @param {User} user
   * @returns
   */
  async sendOfferLinkByEmail(
    id: string,
    offerDto: SendOfferLinkDto,
    user: User
  ) {
    const offer = await this.db.offer.findUnique({
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

    if (!offer) {
      throw new UnauthorizedException("Offer not found!");
    }

    // Send the offer link
    await this.sendOfferEmail(offerDto.email, user.firstname, offer.offer_link);

    return "Offer Sent";
  }

  /**
   * Method to find an offer by ID and token and ensure that the token matches.
   * @param offerId - The ID of the offer
   * @param token - The token to verify
   * @returns The offer if found and token is valid
   */
  async findOfferByIdAndToken(offerId: string, token: string) {
    const offer = await this.db.offer.findUnique({
      where: { id: offerId },
      include: {
        event: {
          include: {
            client: true,
            specification: true
          }
        }
      }
    });

    if (!offer) {
      throw new UnauthorizedException("Offer not found!");
    }

    if (offer.token !== token) {
      throw new UnauthorizedException("Invalid token!");
    }

    return offer;
  }

  async updateOfferStatus(
    offerId: string,
    token: string,
    status: "accepted" | "rejected"
  ) {
    const offer = await this.db.offer.findUnique({
      where: { id: offerId }
    });

    if (!offer || offer.token !== token) {
      throw new UnauthorizedException("Invalid offer or token");
    }

    return await this.db.offer.update({
      where: { id: offerId },
      data: { status }
    });
  }
}
