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
import type { Network } from './interfaces/network.interface';

@Controller('')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

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
}
