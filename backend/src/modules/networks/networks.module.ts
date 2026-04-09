import { Module } from '@nestjs/common';
import { NetworksController } from './networks.controller';
import { NetworksService } from './networks.service';
import { DevicesService } from './devices/devices.service';
import { TagsService } from './tags/tags.service';

@Module({
  controllers: [NetworksController],
  providers: [NetworksService, DevicesService, TagsService]
})
export class NetworksModule {}
