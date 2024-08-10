import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
  Delete
} from "@nestjs/common";
import { ProspectsService } from "./prospects.service";
import { CreateProspectDto } from "./dto/prospects.dto";
import { AuthGuard } from "src/auth/guard";
import { UpdateProspectsDto } from "./dto/update-prospects.dto";
import { CurrentUser } from "src/common/decorators/currentUser.decorator";
import { User } from "@prisma/client";

@UseGuards(AuthGuard)
@Controller("prospects")
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Post("create")
  create(@Body() dto: CreateProspectDto, @CurrentUser() user: User) {
    return this.prospectsService.create(dto, user);
  }

  @Get()
  filter(@Query("source") source: string) {
    return this.prospectsService.filter(source);
  }

  @Get("all")
  findAll(@CurrentUser() user: User) {
    return this.prospectsService.findAll(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: User) {
    return this.prospectsService.findOne(id, user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateProspectsDto,
    @CurrentUser() user: User
  ) {
    return this.prospectsService.update(id, dto, user);
  }

  @Delete(":id")
  delete(@Param("id") id: string, @CurrentUser() user: User) {
    return this.prospectsService.delete(id, user);
  }
}
