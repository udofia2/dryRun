import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateProspectDto } from "./dto/prospects.dto";
import { DatabaseService } from "src/database/database.service";
import {
  CLIENTTYPE,
  LOCATIONTYPE,
  SOURCETYPE,
  STATUSTYPE
} from "src/constants";

@Injectable()
export class ProspectsService {
  constructor(private db: DatabaseService) {}

  async create(dto: CreateProspectDto, req: any) {
    return this.db.$transaction(async (tx) => {
      const { source } = dto;

      // CREATE PROSPECT
      let prospect = await tx.prospect.create({
        data: {
          source: SOURCETYPE[source.toLowerCase()],
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
          exhibitor_id: req.user.id,
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

      return {
        success: true,
        message: "Prospect created successfully",
        data: prospect
      };
    });
  }

  async findAll(req: any) {
    const prospects = await this.db.prospect.findMany({
      where: { exhibitor_id: req.user.id },
      include: {
        client: true
      }
    });
    return {
      success: true,
      message: "Prospects retrieved successfully",
      data: prospects
    };
  }

  async findOne(id: string, req: any) {
    const prospect = await this.db.prospect.findUnique({
      where: { id, exhibitor_id: req.user.id },
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
      message: "Prospect retrieved successfully",
      data: prospect
    };
  }

  async filter(source: string) {
    const prospects = await this.db.prospect.findMany({
      where: { source: SOURCETYPE[source.toLowerCase()] }
    });

    return {
      success: true,
      message: "Prospects retrieved successfully",
      data: prospects
    };
  }

  async update(id: string, status: string, req: any) {
    const prospect = await this.db.prospect.update({
      where: { id },
      data: { status: STATUSTYPE[status.toLowerCase()] }
    });

    if (prospect) {
      if (prospect.exhibitor_id !== req.user.id) {
        throw new UnauthorizedException("Unauthorized access to prospect");
      }
    }

    return {
      success: true,
      message: "Prospect updated successfully",
      data: prospect
    };
  }
}
