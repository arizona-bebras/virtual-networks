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
import { CreateNetworkDto } from "common/dto/network/create-network";
import { NetworkEnterCredentialsDto } from "common/dto/network/enter-credentials";
import { NetworkDto } from "common/dto/network/index";
import { IpAddressStatusDto } from "common/dto/network/ip-address-status";
import { NetworkUsersDto } from "common/dto/network/network-users";
import { UpdateNetworkDto } from "common/dto/network/update-network";
import { Role } from "../../authorization/role.enum.js";
import { Roles } from "../../authorization/roles.decorator.js";
import { RolesGuard } from "../../authorization/roles.guard.js";
import { NetworksService } from "./networks.service.js";

@ApiTags("Networks")
@Controller("networks")
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @Post()
  @ApiOperation({ summary: "Создать новую сеть" })
  @ApiResponse({
    status: 201,
    description: "Сеть успешно создана",
    type: NetworkDto,
  })
  async create(
    @Body() network: CreateNetworkDto,
  ): Promise<NetworkDto | undefined> {
    return await this.networksService.create(network);
  }

  @Get()
  @ApiOperation({ summary: "Получить сети, в которых состоит пользователь" })
  @ApiResponse({
    status: 200,
    description: "Сети получены",
    type: NetworkDto,
    isArray: true,
  })
  async getMyNetworks(): Promise<NetworkDto[]> {
    return await this.networksService.getMyNetworks();
  }

  @Get(":network_id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @ApiOperation({ summary: "Получить сеть по ID" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Сеть найдена", type: NetworkDto })
  @ApiResponse({ status: 404, description: "Сеть не найдена" })
  async get(@Param("network_id") id: string): Promise<NetworkDto | undefined> {
    const network = await this.networksService.read(id);
    if (!network) {
      throw new NotFoundException(`Network with ID ${id} not found`);
    }
    return network;
  }

  @Get(":network_id/users")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @ApiOperation({ summary: "Получить пользователей сети" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({
    status: 200,
    description: "Пользователи сети получены",
    type: NetworkUsersDto,
  })
  @ApiResponse({ status: 404, description: "Сеть не найдена" })
  async getNetworkUsers(
    @Param("network_id") id: string,
  ): Promise<NetworkUsersDto> {
    const users = await this.networksService.getNetworkUsers(id);
    return users;
  }

  @Post(":network_id")
  @ApiOperation({ summary: "Войти в сеть" })
  @ApiBody({ type: NetworkEnterCredentialsDto })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Успешный вход" })
  @ApiResponse({ status: 404, description: "Сеть не найдена" })
  async enter(
    @Body() credentials: NetworkEnterCredentialsDto,
    @Param("network_id") networkId: string,
  ) {
    await this.networksService.enter(credentials, networkId);
  }

  @Put(":network_id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Обновить сеть по ID" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiBody({ type: UpdateNetworkDto })
  @ApiResponse({ status: 200, description: "Сеть успешно обновлена" })
  @ApiResponse({ status: 404, description: "Сеть не найдена" })
  async update(
    @Param("network_id") id: string,
    @Body() network: UpdateNetworkDto,
  ) {
    await this.networksService.update(id, network);
  }

  @Delete(":network_id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
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

  @Get(":network_id/get_free_ip")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Получить ip устройства" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({
    status: 200,
    description: "IP адрес получен",
    schema: {
      type: "object",
      properties: {
        ip: { type: "string" },
      },
      required: ["ip"],
    },
  })
  @ApiResponse({ status: 400, description: "Сеть переполнена" })
  @ApiResponse({
    status: 404,
    description: "Сети с таким network_id не существует",
  })
  async getFreeIp(
    @Param("network_id") networkId: string,
  ): Promise<{ ip: string }> {
    const ip = await this.networksService.getFreeIp(networkId);
    return { ip: ip };
  }

  @Get(":network_id/check_ip")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Проверить занятость ip адреса в сети" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiQuery({
    name: "ip",
    description: "ip адрес, статус которого нужно узнать",
    example: "192.168.0.1",
  })
  @ApiResponse({
    status: 200,
    description: "Информация о статусе адреса получена",
    type: IpAddressStatusDto,
  })
  @ApiResponse({
    status: 400,
    description: "Передан невалидный ip адрес",
  })
  @ApiResponse({
    status: 404,
    description: "Сети с таким network_id не существует",
  })
  async checkIpAvailability(
    @Param("network_id") networkId: string,
    @Query("ip") ipString: string,
  ): Promise<IpAddressStatusDto> {
    const status = await this.networksService.checkIpAvailability(
      networkId,
      ipString,
    );
    return status;
  }
}
