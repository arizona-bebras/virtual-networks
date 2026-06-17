import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { Roles } from "../../authorization/roles.decorator.js";
import { RolesGuard } from "../../authorization/roles.guard.js";
import { Role } from "../../authorization/role.enum.js";
import { EventsService } from "./events.service.js";
import { EventDto } from "common/dto/event/index";
import * as schema from "common/db/schema"

@Controller("networks/:network_id/events")
@UseGuards(AuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Получить события по фильтрам" })
  @ApiQuery({
    name: "user_id",
    description: "id пользователя, инициировавшего событие",
    required: false,
  })
  @ApiQuery({
    name: "action",
    description: "Тип действия",
    required: false,
  })
  @ApiQuery({
    name: "entity",
    description: "Тип сущности события",
    required: false,
  })
  @ApiQuery({
    name: "event_earliest_date",
    description: "Дата, не раньше которой вернуть события",
    required: false,
  })
  @ApiQuery({
    name: "event_latest_date",
    description: "Дата, не позже которой вернуть события",
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "Устройства найдены",
    type: EventDto,
    isArray: true,
  })
  async getEvents(
    @Param("network_id") networkId: string,
    @Query("user_id") userId: string,
    @Query("action") action: "create" | "update" | "delete",
    @Query("entity") entity: "network" | "device" | "tag" | "rule",
    @Query("event_earliest_date") eventEarliestDate: string,
    @Query("event_latest_date") eventLatestDate: string,
  ): Promise<EventDto[]> {
    const events = await this.eventsService.get(
      userId,
      networkId,
      action,
      entity,
      eventEarliestDate,
      eventLatestDate,
    );

    return events
  }
}
