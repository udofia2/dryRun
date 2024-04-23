import { Injectable } from "@nestjs/common";
import { CreateProspectDto } from "./dto/prospects.dto";
import { DatabaseService } from "src/database/database.service";
import { CLIENTTYPE, LOCATIONTYPE } from "@prisma/client";

@Injectable()
export class ProspectsService {
  constructor(private db: DatabaseService) {}

  async create(dto: CreateProspectDto) {
    const { client_name } = dto;
    // CREATE PROSPECT
    let prospect = await this.db.prospect.create({
      data: { client_name }
    });

    // CREATE CLIENT
    await this.db.client.create({
      data: {
        name: dto.client.name,
        type: CLIENTTYPE[dto.client.type],
        email: dto.client.email,
        prospect_id: prospect.id,
        phone_number: dto.client.phone_number
      }
    });

    // CREATE EVENT
    const event = await this.db.event.create({
      data: {
        name: dto.event.name,
        date: new Date(dto.event.date),
        type: dto.event.type,
        description: dto.event.description ?? undefined,
        city: dto.event.city ?? undefined,
        state: dto.event.state ?? undefined,
        location_type: LOCATIONTYPE[dto.event.location_type],
        location_address: dto.event.location_address ?? undefined,
        // TODO: CHANGE EXHIBITOR ID TYPE TO STRING
        exhibitor_id: 1,
        prospect_id: prospect.id
      }
    });

    // CREATE SPECIFICATION
    const specification = await this.db.specification.create({
      data: {
        theme: dto.specification.theme,
        event_id: event.id
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

    console.log(provisions, activities);

    await this.db.provision.createMany({ data: provisions });
    await this.db.activity.createMany({ data: activities });

    prospect = await this.db.prospect.findUnique({
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

    return {
      success: true,
      message: "Prospect created successfully",
      data: prospect
    };
  }

  findAll() {
    return `This action returns all prospects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prospect`;
  }

  remove(id: number) {
    return `This action removes a #${id} prospect`;
  }
}
