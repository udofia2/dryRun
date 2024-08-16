import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query
} from "@nestjs/common";
import { OfferService } from "./offer.service";
import { CreateOfferDto } from "./dto";
import { AuthGuard } from "src/auth/guard";
import { CurrentUser } from "src/common/decorators/currentUser.decorator";
import { User } from "@prisma/client";
import { UpdateOfferDto } from "./dto/update-offer.dto";

@UseGuards(AuthGuard)
@Controller("offers")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post("create")
  create(@Body() dto: CreateOfferDto, @CurrentUser() user: User) {
    return this.offerService.create(dto, user);
  }

  @Get()
  filter(@Query("status") status: string, @CurrentUser() user: User) {
    return this.offerService.filter(status, user);
  }

  @Get("all")
  findAll(@CurrentUser() user: User) {
    return this.offerService.findAll(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: User) {
    return this.offerService.findById(id, user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateOfferDto,
    @CurrentUser() user: User
  ) {
    return this.offerService.update(id, dto, user);
  }

  @Delete(":id")
  delete(@Param("id") id: string, @CurrentUser() user: User) {
    return this.offerService.delete(id, user);
  }
}
