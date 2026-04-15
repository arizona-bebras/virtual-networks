import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import type { Tag } from './interfaces/tag.interface';
import { Tag as TagDto } from '../../swaggerTypes';

@ApiTags('Tags')
@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый тег' })
  @ApiParam({ name: 'network_id', description: 'UUID сети', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @ApiBody({ type: TagDto })
  @ApiResponse({ status: 201, description: 'Тег успешно создан' })
  async createTag(@Param('network_id') network_id: string, @Body() tag: Tag) {
    await this.tagsService.create(tag, network_id);
  }

  @Get(':tag_id')
  @ApiOperation({ summary: 'Получить тег по ID' })
  @ApiParam({ name: 'tag_id', description: 'UUID тега', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @ApiResponse({ status: 200, description: 'Тег найден', type: TagDto })
  @ApiResponse({ status: 404, description: 'Тег не найден' })
  async getTag(@Param('tag_id') id: string) {
    return await this.tagsService.read(id);
  }

  @Put(':tag_id')
  @ApiOperation({ summary: 'Обновить тег по ID' })
  @ApiParam({ name: 'tag_id', description: 'UUID тега', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @ApiBody({ type: TagDto })
  @ApiResponse({ status: 200, description: 'Тег успешно обновлён' })
  @ApiResponse({ status: 404, description: 'Тег не найден' })
  async updateTag(@Param('tag_id') id: string, @Body() tag: Tag) {
    await this.tagsService.update(id, tag);
  }

  @Delete(':tag_id')
  @ApiOperation({ summary: 'Удалить тег по ID' })
  @ApiParam({ name: 'tag_id', description: 'UUID тега', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @ApiResponse({ status: 200, description: 'Тег успешно удалён' })
  @ApiResponse({ status: 404, description: 'Тег не найден' })
  async deleteTag(@Param('tag_id') id: string) {
    await this.tagsService.delete(id);
  }
}