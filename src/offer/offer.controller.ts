import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query
} from "@nestjs/common";
import { OfferService } from "./offer.service";
import { CreateOfferDto } from "./dto";
import { AuthGuard } from "src/auth/guard";

@UseGuards(AuthGuard)
@Controller("offers")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post("create")
  create(@Body() dto: CreateOfferDto, @Req() req: any) {
    return this.offerService.create(dto, req);
  }

  @Get()
  filter(@Query("status") status: string, @Req() req: any) {
    return this.offerService.filter(status, req);
  }

  @Get("all")
  findAll(@Req() req: any) {
    return this.offerService.findAll(req);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.offerService.findOne(+id);
  }

  @Patch("update-status/:id")
  updateOfferStatus(
    @Param("id") id: string,
    @Body("status") status: string,
    @Req() req: Request
  ) {
    return this.offerService.updateOfferStatus(id, status, req);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.offerService.remove(+id);
  }
}
