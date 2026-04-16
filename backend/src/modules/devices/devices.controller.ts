import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Device as DeviceDto } from "../../swaggerTypes";
import { DevicesService } from "./devices.service";
import type { Device } from "./interfaces/device.interface";

@ApiTags("Devices")
@Controller()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post("")
  @ApiOperation({ summary: "Создать новое устройство" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiBody({ type: DeviceDto })
  @ApiResponse({ status: 201, description: "Устройство успешно создано" })
  async createDevice(
    @Param("network_id") network_id: string,
    @Body() device: Device,
  ) {
    await this.devicesService.create(device, network_id);
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
  @ApiOperation({ summary: "Обновить устройство по ID" })
  @ApiParam({
    name: "device_id",
    description: "UUID устройства",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiBody({ type: DeviceDto })
  @ApiResponse({ status: 200, description: "Устройство успешно обновлено" })
  @ApiResponse({ status: 404, description: "Устройство не найдено" })
  async updateDevice(@Param("device_id") id: string, @Body() device: Device) {
    await this.devicesService.update(id, device);
  }

  @Delete(":device_id")
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
