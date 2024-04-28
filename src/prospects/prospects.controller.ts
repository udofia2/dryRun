import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  Patch
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
  filter(@Query("source") source: string) {
    return this.prospectsService.filter(source);
  }

  @Get("all")
  findAll(@Req() req: Request) {
    return this.prospectsService.findAll(req);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: Request) {
    return this.prospectsService.findOne(id, req);
  }

  @Patch("update-status/:id")
  update(
    @Param("id") id: string,
    @Body("status") status: string,
    @Req() req: Request
  ) {
    return this.prospectsService.update(id, status, req);
  }
}
