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
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { Role } from "../../authorization/role.enum";
import { Roles } from "../../authorization/roles.decorator";
import { RolesGuard } from "../../authorization/roles.guard";
import { Tag as TagDto } from "../../swaggerTypes";
import type { Tag } from "./interfaces/tag.interface";
import { TagsService } from "./tags.service";

@ApiTags("Tags")
@Controller("networks/:network_id/tags")
@UseGuards(AuthGuard, RolesGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Создать новый тег" })
  @ApiParam({
    name: "network_id",
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiBody({ type: TagDto })
  @ApiResponse({ status: 201, description: "Тег успешно создан" })
  async createTag(@Param("network_id") network_id: string, @Body() tag: Tag) {
    await this.tagsService.create(tag, network_id);
  }

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Получить теги сети" })
  @ApiQuery({
    name: "q",
    description: "Пойсковой запрос по названию",
    example: "Разраб",
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "Теги получены",
    type: TagDto,
    isArray: true,
  })
  async getAllTags(
    @Param("network_id") network_id: string,
    @Query("q") q: string,
  ) {
    return await this.tagsService.getAllTags(network_id, q);
  }

  @Get(":tag_id")
  @ApiOperation({ summary: "Получить тег по ID" })
  @ApiParam({
    name: "tag_id",
    description: "UUID тега",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Тег найден", type: TagDto })
  @ApiResponse({ status: 404, description: "Тег не найден" })
  async getTag(@Param("tag_id") id: string) {
    return await this.tagsService.read(id);
  }

  @Put(":tag_id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Обновить тег по ID" })
  @ApiParam({
    name: "tag_id",
    description: "UUID тега",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiBody({ type: TagDto })
  @ApiResponse({ status: 200, description: "Тег успешно обновлён" })
  @ApiResponse({ status: 404, description: "Тег не найден" })
  async updateTag(@Param("tag_id") id: string, @Body() tag: Tag) {
    await this.tagsService.update(id, tag);
  }

  @Delete(":tag_id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Удалить тег по ID" })
  @ApiParam({
    name: "tag_id",
    description: "UUID тега",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Тег успешно удалён" })
  @ApiResponse({ status: 404, description: "Тег не найден" })
  async deleteTag(@Param("tag_id") id: string) {
    await this.tagsService.delete(id);
  }
}
