import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { ProspectsService } from "./prospects.service";
import { CreateProspectDto } from "./dto/prospects.dto";

@Controller("prospects")
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Post()
  create(@Body() createProspectDto: CreateProspectDto) {
    return this.prospectsService.create(createProspectDto);
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
