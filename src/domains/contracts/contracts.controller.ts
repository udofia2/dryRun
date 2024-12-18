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
import { ContractsService } from "./contracts.service";
import { CreateContractDto } from "./dtos/create-contract.dto";
import { UpdateContractDto } from "./dtos/update-contract.dto";
import { CurrentUser, ResourceModel } from "src/common/decorators";
import { User } from "@prisma/client";
import { AuthGuard } from "src/auth/guard";
import { VendorGuard } from "src/common/guards";
import { QueryContractDto } from "./dtos/query-contract.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "../../auth/decorator/public.decorator";
import { SendContractLinkDto } from "./dtos/contract.dto";

@ApiTags("Contracts")
@Controller("contracts")
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateContractDto, @CurrentUser() user: User) {
    return this.contractsService.create(dto, user);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Query() query: QueryContractDto, @CurrentUser() user: User) {
    return this.contractsService.findAll(query, user);
  }

  @ApiBearerAuth()
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contractsService.findOne(id);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @ResourceModel("contract")
  @UseGuards(VendorGuard)
  update(@Param("id") id: string, @Body() dto: UpdateContractDto) {
    return this.contractsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @ResourceModel("contract")
  @UseGuards(VendorGuard)
  remove(@Param("id") id: string) {
    return this.contractsService.remove(id);
  }

  @ApiBearerAuth()
  @Get("link/:id")
  getContractLink(@Param("id") id: string, @CurrentUser() user: User) {
    return this.contractsService.findContractLink(id, user);
  }

  @ApiBearerAuth()
  @Post("send/link/:id")
  sendContractLinkByMail(
    @Param("id") id: string,
    @Body() contractDto: SendContractLinkDto,
    @CurrentUser() user: User
  ) {
    return this.contractsService.sendContractLinkByEmail(id, contractDto, user);
  }

  @Public()
  @Get("view/:contractId/:token")
  async viewContract(
    @Param("contractId") offerId: string,
    @Param("token") token: string
  ) {
    const contract = await this.contractsService.findContractByIdAndToken(
      offerId,
      token
    );
    return contract;
  }

  @Public()
  @Post("accept/:contractId/:token")
  async acceptContract(
    @Param("contractId") contractId: string,
    @Param("token") token: string
  ) {
    return this.contractsService.updateContractStatus(
      contractId,
      token,
      "accepted"
    );
  }

  @Public()
  @Post("reject/:contractId/:token")
  async rejectContract(
    @Param("contractId") contractId: string,
    @Param("token") token: string
  ) {
    return this.contractsService.updateContractStatus(
      contractId,
      token,
      "rejected"
    );
  }
}
