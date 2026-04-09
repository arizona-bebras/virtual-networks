import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { NetworksService } from './networks.service';
import { DevicesService } from './devices/devices.service';
import { TagsService } from './tags/tags.service';
import type { Network, Device, Tag } from './interfaces/network.interface';

@Controller('networks')
export class NetworksController {
  constructor(
    private readonly networksService: NetworksService,
    private readonly devicesService: DevicesService,
    private readonly tagsService: TagsService,
  ) {}

  /**NETWORK */

  @Post()
  async create(@Body() network: Network) {
    await this.networksService.create(network);
  }

  @Get(':network_id')
  async get(@Param('network_id') id: string) {
    return await this.networksService.read(id);
  }

  @Put(':network_id')
  async update(@Param('network_id') id: string, @Body() network: Network) {
    await this.networksService.update(id, network);
  }

  @Delete(':network_id')
  async delete(@Param('network_id') id: string) {
    await this.networksService.delete(id);
  }

  /**DEVICES */

  @Post(':network_id/devices')
  async createDevice(
    @Param('network_id') network_id: string,
    @Body() device: Device,
  ) {
    await this.devicesService.create(device, network_id);
  }

  @Get(':network_id/devices/:device_id')
  async getDevice(@Param('device_id') id: string) {
    return await this.devicesService.read(id);
  }

  @Put(':network_id/devices/:device_id')
  async updateDevice(@Param('device_id') id: string, @Body() device: Device) {
    await this.devicesService.update(id, device);
  }

  @Delete(':network_id/devices/:device_id')
  async deleteDevice(@Param('device_id') id: string) {
    await this.devicesService.delete(id);
  }

  /**TAGS */

  @Post(':network_id/tags')
  async createTag(@Param('network_id') network_id: string, @Body() tag: Tag) {
    await this.tagsService.create(tag, network_id);
  }

  @Get(':network_id/tags/:tag_id')
  async getTag(@Param('tag_id') id: string) {
    return await this.tagsService.read(id);
  }

  @Put(':network_id/tags/:tag_id')
  async updateTag(@Param('tag_id') id: string, @Body() tag: Tag) {
    await this.tagsService.update(id, tag);
  }

  @Delete(':network_id/tags/:tag_id')
  async deleteTag(@Param('tag_id') id: string) {
    await this.tagsService.delete(id);
  }
}
