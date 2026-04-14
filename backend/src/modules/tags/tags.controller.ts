import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import type { Tag } from './interfaces/tag.interface';

@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async createTag(@Param('network_id') network_id: string, @Body() tag: Tag) {
    await this.tagsService.create(tag, network_id);
  }

  @Get(':tag_id')
  async getTag(@Param('tag_id') id: string) {
    return await this.tagsService.read(id);
  }

  @Put(':tag_id')
  async updateTag(@Param('tag_id') id: string, @Body() tag: Tag) {
    await this.tagsService.update(id, tag);
  }

  @Delete(':tag_id')
  async deleteTag(@Param('tag_id') id: string) {
    await this.tagsService.delete(id);
  }
}
