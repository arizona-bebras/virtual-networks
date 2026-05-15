import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Session,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { CreateNetworkDto } from "common/dto/network/create-network";
import { NetworkEnterCredentialsDto } from "common/dto/network/enter-credentials";
import { NetworkDto } from "common/dto/network/index";
import { NetworkUsersDto } from "common/dto/network/network-users";
import { UpdateNetworkDto } from "common/dto/network/update-network";
import { Role } from "../../authorization/role.enum";
import { Roles } from "../../authorization/roles.decorator";
import { RolesGuard } from "../../authorization/roles.guard";
import { NetworksService } from "./networks.service";

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
    @Session() session: UserSession,
  ): Promise<NetworkDto | undefined> {
    return await this.networksService.create(network, session.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Получить сети, в которых состоит пользователь" })
  @ApiResponse({
    status: 200,
    description: "Сети получены",
    type: NetworkDto,
    isArray: true,
  })
  async getMyNetworks(@Session() session: UserSession): Promise<NetworkDto[]> {
    return await this.networksService.getMyNetworks(session.user.id);
  }

  @Get(":network_id")
  @UseGuards(AuthGuard, RolesGuard)
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
    @Session() session: UserSession,
  ): Promise<NetworkUsersDto> {
    const users = await this.networksService.getNetworkUsers(
      id,
      session.user.id,
    );
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
    @Session() session: UserSession,
  ) {
    await this.networksService.enter(credentials, networkId, session.user.id);
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
  @ApiOperation({ summary: "Добавить тег на устройство" })
  @ApiResponse({
    status: 200,
    description: "IP адрес получен",
  })
  @ApiResponse({ status: 400, description: "Сеть переполнена" })
  @ApiResponse({
    status: 404,
    description: "Сети с таким network_id не существует",
  })
  async getFreeIp(@Param("network_id") networkId: string) {
    const ip = await this.networksService.getFreeIp(networkId);
    return { ip: ip };
  }
}
