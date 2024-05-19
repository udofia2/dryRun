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
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto";
import { AuthGuard } from "src/auth/guard";

@UseGuards(AuthGuard)
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post("create")
  create(@Body() createEventDto: CreateEventDto, @Req() req: Request) {
    return this.eventsService.create(createEventDto, req);
  }

  @Get("all")
  findAll(@Req() req: Request) {
    return this.eventsService.findAll(req);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: Request) {
    return this.eventsService.findOne(id, req);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.eventsService.remove(+id);
  }
}
