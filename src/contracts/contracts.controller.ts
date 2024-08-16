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
import { ExhibitorGuard } from "src/common/guards";
import { QueryContractDto } from "./dtos/query-contract.dto";

@Controller("contracts")
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() dto: CreateContractDto, @CurrentUser() user: User) {
    return this.contractsService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: QueryContractDto, @CurrentUser() user: User) {
    return this.contractsService.findAll(query, user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(":id")
  @ResourceModel("contract")
  @UseGuards(ExhibitorGuard)
  update(@Param("id") id: string, @Body() dto: UpdateContractDto) {
    return this.contractsService.update(id, dto);
  }

  @Delete(":id")
  @ResourceModel("contract")
  @UseGuards(ExhibitorGuard)
  remove(@Param("id") id: string) {
    return this.contractsService.remove(id);
  }
}
