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
import { Network as NetworkDto } from "../../swaggerTypes";
import type { Network } from "./interfaces/network.interface";
import { NetworksService } from "./networks.service";

@ApiTags("Networks")
@Controller("")
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @Post()
  @ApiOperation({ summary: "Создать новую сеть" })
  @ApiBody({ type: NetworkDto })
  @ApiResponse({ status: 201, description: "Сеть успешно создана" })
  async create(@Body() network: Network) {
    await this.networksService.create(network);
  }

  @Get(":network_id")
  @ApiOperation({ summary: "Получить сеть по ID" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Сеть найдена", type: NetworkDto })
  @ApiResponse({ status: 404, description: "Сеть не найдена" })
  async get(@Param("network_id") id: string) {
    return await this.networksService.read(id);
  }

  @Put(":network_id")
  @ApiOperation({ summary: "Обновить сеть по ID" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiBody({ type: NetworkDto })
  @ApiResponse({ status: 200, description: "Сеть успешно обновлена" })
  @ApiResponse({ status: 404, description: "Сеть не найдена" })
  async update(@Param("network_id") id: string, @Body() network: Network) {
    await this.networksService.update(id, network);
  }

  @Delete(":network_id")
  @ApiOperation({ summary: "Удалить сеть по ID" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Сеть успешно удалена" })
  @ApiResponse({ status: 404, description: "Сеть не найдена" })
  async delete(@Param("network_id") id: string) {
    await this.networksService.delete(id);
  }
}
