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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "../../auth/decorator/public.decorator";

@ApiTags("Offers")
@UseGuards(AuthGuard)
@Controller("offers")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @ApiBearerAuth()
  @Post("create")
  create(@Body() dto: CreateOfferDto, @CurrentUser() user: User) {
    return this.offerService.create(dto, user);
  }

  @ApiBearerAuth()
  @Get()
  filter(@Query("status") status: string, @CurrentUser() user: User) {
    return this.offerService.filter(status, user);
  }

  @ApiBearerAuth()
  @Get("all")
  findAll(@CurrentUser() user: User) {
    return this.offerService.findAll(user);
  }

  @ApiBearerAuth()
  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: User) {
    return this.offerService.findById(id, user);
  }

  @ApiBearerAuth()
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateOfferDto,
    @CurrentUser() user: User
  ) {
    return this.offerService.update(id, dto, user);
  }

  @ApiBearerAuth()
  @Delete(":id")
  delete(@Param("id") id: string, @CurrentUser() user: User) {
    return this.offerService.delete(id, user);
  }

  @ApiBearerAuth()
  @Get("link/:id")
  getOfferLink(@Param("id") id: string, @CurrentUser() user: User) {
    return this.offerService.findOfferLink(id, user);
  }

  @ApiBearerAuth()
  @Post("send/link/:id")
  sendOfferLinkByMail(@Param("id") id: string, @CurrentUser() user: User) {
    return this.offerService.sendOfferLinkByEmail(id, user);
  }

  @Public()
  @Get("view/:offerId/:token")
  async viewOffer(
    @Param("offerId") offerId: string,
    @Param("token") token: string
  ) {
    const offer = await this.offerService.findOfferByIdAndToken(
      offerId,
      token
    );
    return offer;
  }

  @Public()
  @Post("accept/:offerId/:token")
  async acceptOffer(
    @Param("offerId") offerId: string,
    @Param("token") token: string
  ) {
    return this.offerService.updateOfferStatus(offerId, token, "accepted");
  }

  @Public()
  @Post("reject/:offerId/:token")
  async rejectOffer(
    @Param("offerId") offerId: string,
    @Param("token") token: string
  ) {
    return this.offerService.updateOfferStatus(offerId, token, "rejected");
  }
}
