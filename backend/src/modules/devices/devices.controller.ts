import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Body,
} from '@nestjs/common';
import type { Device } from './interfaces/device.interface';
import { DevicesService } from './devices.service';

@Controller()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('')
  async createDevice(
    @Param('network_id') network_id: string,
    @Body() device: Device,
  ) {
    await this.devicesService.create(device, network_id);
  }

  @Get(':device_id')
  async getDevice(@Param('device_id') id: string) {
    return await this.devicesService.read(id);
  }

  @Put(':device_id')
  async updateDevice(@Param('device_id') id: string, @Body() device: Device) {
    await this.devicesService.update(id, device);
  }

  @Delete(':device_id')
  async deleteDevice(@Param('device_id') id: string) {
    await this.devicesService.delete(id);
  }
}
