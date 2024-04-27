import { Injectable } from "@nestjs/common";
import { CreateOfferDto } from "./dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { DatabaseService } from "src/database/database.service";
import { CLIENTTYPE } from "src/constants";

@Injectable()
export class OfferService {
  constructor(private db: DatabaseService) {}
  async create(dto: CreateOfferDto) {
    return this.db.$transaction(async (tx) => {
      let offer = await tx.offer.create({
        data: {
          client: {
            connectOrCreate: {
              where: { email: dto.client.email },
              create: {
                email: dto.client.email,
                name: dto.client.name,
                type: CLIENTTYPE[dto.client.type.toLowerCase()],
                phone_number: dto.client.phone_number
              }
            }
          }
        }
      });
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
