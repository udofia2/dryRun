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

@Controller("invoices")
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // @Post("")
  // createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: User) {
  //   return this.paymentsService.createInvoice(dto, user);
  // }

  @Get("")
  findAllUser(
    @Query() query: QueryInvoiceDto,
    @CurrentUser("id") userId: string
  ) {
    return this.paymentsService.findAllUserInvoices(query, userId);
  }

  @Get("/:id")
  findOneInvoice(@Param("id") id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch("/:id")
  updateInvoice(@Param("id") id: string, @Body() dto: UpdateInvoiceDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete("/:id")
  removeInvoice(@Param("id") id: string) {
    return this.paymentsService.remove(id);
  }
}
