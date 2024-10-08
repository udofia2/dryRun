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

@Controller("payments")
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // @Post("invoices")
  // createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: User) {
  //   return this.paymentsService.createInvoice(dto, user);
  // }

  @Get("invoices")
  findAllUserInvoices(
    @Query() query: QueryInvoiceDto,
    @CurrentUser("id") userId: string
  ) {
    return this.paymentsService.findAllUserInvoices(query, userId);
  }

  @Get("invoices/:id")
  findOneInvoice(@Param("id") id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch("invoices/:id")
  updateInvoice(@Param("id") id: string, @Body() dto: UpdateInvoiceDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete("invoices/:id")
  removeInvoice(@Param("id") id: string) {
    return this.paymentsService.remove(id);
  }
}
