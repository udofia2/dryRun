import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiHeader
} from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guard";
import { CurrentUser } from "src/common/decorators";
import { User } from "@prisma/client";
import { UpdateEntryPassDto } from "./dto/update-entry-pass.dto";
import { QueryEntryPassDto } from "./dto/query-entry-pass.dto";
import { EntryPassService } from "./entry-passes.service";
import { CreateEntryPassDto } from "./dto/create-entry-pass.dto";
import { PaystackWebhookDto } from "./dto/webhook.dto";

@ApiTags("EntryPass")
@Controller("entry-passes")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class EntryPassController {
  constructor(private readonly entryPassService: EntryPassService) {}

  @Post()
  @ApiOperation({ summary: "Create a new entry pass" })
  @ApiResponse({ status: 201, description: "Entry pass created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async create(
    @Body() createEntryPassDto: CreateEntryPassDto,
    @CurrentUser() user: User
  ) {
    return this.entryPassService.create(createEntryPassDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get all entry passes" })
  @ApiResponse({
    status: 200,
    description: "List of entry passes retrieved successfully."
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async findAll(@Query() query: QueryEntryPassDto, @CurrentUser() user: User) {
    return this.entryPassService.findAll(query, user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an entry pass by ID" })
  @ApiResponse({
    status: 200,
    description: "Entry pass retrieved successfully with user purchase info."
  })
  @ApiResponse({ status: 404, description: "Entry pass not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async findOne(@Param("id") id: string, @CurrentUser() user: User) {
    const entryPass = await this.entryPassService.findOne(id, user);
    const userPurchase = await this.entryPassService.getUserPurchaseInfo(
      id,
      user.id
    );

    return {
      ...entryPass,
      userPurchaseQuantity: userPurchase?.quantity || 0
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an entry pass by ID" })
  @ApiResponse({ status: 200, description: "Entry pass updated successfully." })
  @ApiResponse({ status: 404, description: "Entry pass not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async update(
    @Param("id") id: string,
    @Body() updateEntryPassDto: UpdateEntryPassDto,
    @CurrentUser() user: User
  ) {
    return this.entryPassService.update(id, updateEntryPassDto, user);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an entry pass by ID" })
  @ApiResponse({ status: 200, description: "Entry pass deleted successfully." })
  @ApiResponse({ status: 404, description: "Entry pass not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.entryPassService.remove(id, user);
  }

  @Post(":id/send-invite")
  @ApiOperation({ summary: "Send an invite for an entry pass" })
  @ApiResponse({ status: 200, description: "Invite sent successfully." })
  @ApiResponse({ status: 404, description: "Entry pass not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async sendInvite(@Param("id") id: string, @CurrentUser() user: User) {
    return this.entryPassService.sendInvite(id, user);
  }

  @Get(":id/purchase-info")
  @ApiOperation({
    summary: "Get user's purchase information for an entry pass"
  })
  @ApiResponse({
    status: 200,
    description: "User purchase information retrieved successfully."
  })
  @ApiResponse({ status: 404, description: "Entry pass not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async getPurchaseInfo(@Param("id") id: string, @CurrentUser() user: User) {
    return this.entryPassService.getUserPurchaseInfo(id, user.id);
  }

  @Post("webhook/paystack")
  @ApiHeader({
    name: "x-paystack-signature",
    description: "Paystack signature"
  })
  @ApiOperation({ summary: "Handle Paystack webhook" })
  @ApiResponse({ status: 200, description: "Webhook processed successfully." })
  @ApiResponse({ status: 422, description: "Invalid signature or payload." })
  async handlePaystackWebhook(
    @Headers("x-paystack-signature") signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() webhookData: PaystackWebhookDto
  ) {
    return this.entryPassService.handlePaystackWebhook(
      signature,
      req.rawBody.toString(),
      webhookData
    );
  }
}
