import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto";
import { AuthGuard } from "src/auth/guard";
import { CurrentUser } from "src/common/decorators";
import { User } from "@prisma/client";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse
} from "@nestjs/swagger";
import { Public } from "src/auth/decorator/public.decorator";
import { SendEventLinkDto } from "./dto/event.dto";

@UseGuards(AuthGuard)
@ApiTags("Events")
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: "Create a new event" })
  @ApiResponse({ status: 201, description: "Event created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiBearerAuth()
  @Post("create")
  create(@Body() dto: CreateEventDto, @CurrentUser() user: User) {
    return this.eventsService.create(dto, user);
  }

  @ApiOperation({ summary: "Get all events" })
  @ApiResponse({ status: 200, description: "List of all events" })
  @ApiBearerAuth()
  @Get("all")
  findAll(@CurrentUser() user: User) {
    return this.eventsService.findAll(user);
  }

  @ApiOperation({ summary: "Get a specific event by ID" })
  @ApiResponse({ status: 200, description: "Event found successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  @ApiBearerAuth()
  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: User) {
    return this.eventsService.findOne(id, user);
  }

  @ApiOperation({ summary: "Update a specific event by ID" })
  @ApiResponse({ status: 200, description: "Event updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "Event not found" })
  @ApiBearerAuth()
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: User
  ) {
    return this.eventsService.update(id, dto, user);
  }

  @ApiOperation({ summary: "Delete a specific event by ID" })
  @ApiResponse({ status: 200, description: "Event removed successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  @ApiBearerAuth()
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.eventsService.remove(id, user);
  }

  @Public()
  @Get("customized/link")
  getEventByCustomizedLink(
    @Param("customizedEventlink") cusomizedEvent: string
  ) {
    return this.eventsService.findCustomizedEventLink(cusomizedEvent);
  }

  @ApiBearerAuth()
  @Get("link/:id")
  getEventLink(@Param("id") id: string, @CurrentUser() user: User) {
    return this.eventsService.findEventLink(id, user);
  }

  @ApiBearerAuth()
  @Post("send/link/:id")
  @ApiOkResponse()
  @ApiBadRequestResponse()
  sendEventLinkByMail(
    @Param("id") id: string,
    @Body() eventDto: SendEventLinkDto,
    @CurrentUser() user: User
  ) {
    return this.eventsService.sendEventLinkByEmail(id, eventDto, user);
  }

  @Public()
  @Get("view/:eventId/:token")
  async viewEvent(
    @Param("eventId") offerId: string,
    @Param("token") token: string
  ) {
    const event = await this.eventsService.findEventByIdAndToken(
      offerId,
      token
    );
    return event;
  }

  @Public()
  @Post("accept/:eventId/:token")
  async acceptEvent(
    @Param("eventId") eventId: string,
    @Param("token") token: string
  ) {
    return this.eventsService.updateEventStatus(eventId, token, "accepted");
  }

  @Public()
  @Post("reject/:eventId/:token")
  async rejectEvent(
    @Param("eventId") eventId: string,
    @Param("token") token: string
  ) {
    return this.eventsService.updateEventStatus(eventId, token, "rejected");
  }
}
