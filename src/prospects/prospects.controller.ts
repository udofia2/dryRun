import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req
} from "@nestjs/common";
import { ProspectsService } from "./prospects.service";
import { CreateProspectDto } from "./dto/prospects.dto";
import { AuthGuard } from "src/auth/guard";

@UseGuards(AuthGuard)
@Controller("prospects")
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Post()
  create(@Body() dto: CreateProspectDto, @Req() req: Request) {
    return this.prospectsService.create(dto, req);
  }

  @Get()
  findAll() {
    return this.prospectsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.prospectsService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.prospectsService.remove(+id);
  }
}
