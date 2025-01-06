import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreateInvoiceDto } from "./dto/create-payment.dto";
import { UpdateInvoiceDto } from "./dto/update-payment.dto";
import { CurrentUser } from "src/common/decorators";
import { User } from "@prisma/client";
import { QueryInvoiceDto } from "./dto/query-invoice.dto";
import { AuthGuard } from "src/auth/guard";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from "@nestjs/swagger";
import { Public } from "../../auth/decorator/public.decorator";
import { SendInvoiceLinkDto } from "./dto/payment.dto";

@ApiTags("Invoice")
@Controller("invoices")
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("")
  @ApiBearerAuth()
  createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: User) {
    return this.paymentsService.createInvoice(dto, user);
  }

  @Get("")
  @ApiBearerAuth()
  findAllUser(
    @Query() query: QueryInvoiceDto,
    @CurrentUser("id") userId: string
  ) {
    return this.paymentsService.findAllUserInvoices(query, userId);
  }

  @Get("/:id")
  @ApiBearerAuth()
  findOneInvoice(@Param("id") id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch("/:id")
  @ApiBearerAuth()
  updateInvoice(@Param("id") id: string, @Body() dto: UpdateInvoiceDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete("/:id")
  @ApiBearerAuth()
  removeInvoice(@Param("id") id: string) {
    return this.paymentsService.remove(id);
  }

  @ApiBearerAuth()
  @Get("link/:id")
  getInvoiceLink(@Param("id") id: string, @CurrentUser() user: User) {
    return this.paymentsService.findInvoiceLink(id, user);
  }

  @ApiBearerAuth()
  @Post("send/link/:id")
  @ApiOkResponse()
  @ApiBadRequestResponse()
  sendInvoiceLinkByMail(
    @Param("id") id: string,
    @Body() invoiceDto: SendInvoiceLinkDto,
    @CurrentUser() user: User
  ) {
    return this.paymentsService.sendInvoiceLinkByEmail(id, invoiceDto, user);
  }

  @Public()
  @Get("view/:invoiceId/:token")
  async viewInvoice(
    @Param("invoiceId") offerId: string,
    @Param("token") token: string
  ) {
    const invoice = await this.paymentsService.findInvoiceByIdAndToken(
      offerId,
      token
    );
    return invoice;
  }

  @Public()
  @Post("accept/:invoiceId/:token")
  async acceptInvoice(
    @Param("invoiceId") invoiceId: string,
    @Param("token") token: string
  ) {
    return this.paymentsService.updateInvoiceStatus(
      invoiceId,
      token,
      "accepted"
    );
  }

  @Public()
  @Post("reject/:invoiceId/:token")
  async rejectInvoice(
    @Param("invoiceId") invoiceId: string,
    @Param("token") token: string
  ) {
    return this.paymentsService.updateInvoiceStatus(
      invoiceId,
      token,
      "rejected"
    );
  }
}
