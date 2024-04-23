import { Injectable } from "@nestjs/common";
import { CreateProspectDto } from "./dto/prospects.dto";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class ProspectsService {
  constructor(private db: DatabaseService) {}

  async create(dto: CreateProspectDto) {
    return "This action adds a new prospect";
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
