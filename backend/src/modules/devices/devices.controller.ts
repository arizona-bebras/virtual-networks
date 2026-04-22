import {
  Body,
  Controller,
  Delete,
  Get,
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
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { AuthGuard, Session } from "@thallesp/nestjs-better-auth";
import { CreateDeviceDto } from "common/dto/device/create-device";
import { DeviceDto } from "common/dto/device/index";
import { UpdateDeviceDto } from "common/dto/device/update-device";
import { Role } from "../../authorization/role.enum";
import { Roles } from "../../authorization/roles.decorator";
import { RolesGuard } from "../../authorization/roles.guard";
import { DevicesService } from "./devices.service";

@ApiTags("Devices")
@Controller("networks/:network_id/devices")
@UseGuards(AuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post("")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Создать новое устройство" })
  @ApiBody({ type: CreateDeviceDto })
  @ApiResponse({ status: 201, description: "Устройство успешно создано" })
  async createDevice(
    @Param("network_id") network_id: string,
    @Body() device: CreateDeviceDto,
    @Session() session: UserSession,
  ) {
    await this.devicesService.create(
      { ownerId: session.user.id, ...device },
      network_id,
    );
  }

  @Get("")
  @ApiOperation({ summary: "Получить устройства по фильтрам" })
  @ApiQuery({
    name: "q",
    description: "Пойсковой запрос по названию",
    example: "PC",
    required: false,
  })
  @ApiQuery({
    name: "tags",
    description: "Названия тэгов, повешенных на устройство",
    example: "Бухгалтерия,разработка",
    required: false,
  })
  @ApiQuery({
    name: "owner_id",
    description: "UUID владельца устройства",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "Устройства найдены",
    type: DeviceDto,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: "Устройства не найдены" })
  async getDevicesWithFilters(
    @Param("network_id") networkId: string,
    @Query("q") q: string,
    @Query("tags") tags: string,
    @Query("owner_id") ownerId: string,
  ) {
    return await this.devicesService.read(
      networkId,
      undefined,
      tags,
      ownerId,
      q,
    );
  }

  @Get(":device_id")
  @ApiOperation({ summary: "Получить устройство по ID" })
  @ApiParam({
    name: "device_id",
    description: "UUID устройства",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({
    status: 200,
    description: "Устройство найдено",
    type: DeviceDto,
  })
  @ApiResponse({ status: 404, description: "Устройство не найдено" })
  async getDevice(@Param("device_id") id: string) {
    return await this.devicesService.read(id);
  }

  @Put(":device_id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Обновить устройство по ID" })
  @ApiParam({
    name: "device_id",
    description: "UUID устройства",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiBody({ type: UpdateDeviceDto })
  @ApiResponse({ status: 200, description: "Устройство успешно обновлено" })
  @ApiResponse({ status: 404, description: "Устройство не найдено" })
  async updateDevice(
    @Param("device_id") id: string,
    @Body() device: UpdateDeviceDto,
  ) {
    await this.devicesService.update(id, device);
  }

  @Delete(":device_id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Удалить устройство по ID" })
  @ApiParam({
    name: "device_id",
    description: "UUID устройства",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Устройство успешно удалено" })
  @ApiResponse({ status: 404, description: "Устройство не найдено" })
  async deleteDevice(@Param("device_id") id: string) {
    await this.devicesService.delete(id);
  }
}
