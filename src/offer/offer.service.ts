import { Injectable } from "@nestjs/common";
import { CreateOfferDto } from "./dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { DatabaseService } from "src/database/database.service";
import { CLIENTTYPE, LOCATIONTYPE } from "src/constants";
import { PAYMENTSTRUCTURE } from "@prisma/client";

@Injectable()
export class OfferService {
  constructor(private db: DatabaseService) {}

  /**
   * CREATE STANDALONE OFFER
   * @param dto
   * @param req
   * @returns
   */
  async create(dto: CreateOfferDto, req: any) {
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
          exhibitor: { connect: { id: req.user.id } },
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
          exhibitor: { connect: { id: req.user.id } },
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

      return {
        success: true,
        message: "Offer created successfully",
        data: offer
      };
    });
  }

  findAll() {
    return `This action returns all offer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} offer`;
  }

  update(id: number, updateOfferDto: UpdateOfferDto) {
    return `This action updates a #${id} offer`;
  }

  remove(id: number) {
    return `This action removes a #${id} offer`;
  }
}
