import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req
} from "@nestjs/common";
import { OfferService } from "./offer.service";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { CreateOfferDto } from "./dto";
import { AuthGuard } from "src/auth/guard";

@UseGuards(AuthGuard)
@Controller("offer")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  create(@Body() dto: CreateOfferDto, @Req() req: any) {
    return this.offerService.create(dto, req);
  }

  @Get()
  findAll() {
    return this.offerService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.offerService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offerService.update(+id, updateOfferDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.offerService.remove(+id);
  }
}
