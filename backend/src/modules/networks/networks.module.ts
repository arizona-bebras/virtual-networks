import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { NetworksController } from './networks.controller';
import { NetworksService } from './networks.service';
import { DevicesModule } from '../devices/devices.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    DevicesModule,
    TagsModule,
    RouterModule.register([
      {
        path: 'networks',
        module: NetworksModule,
        children: [
          {
            path: ':network_id/devices',
            module: DevicesModule,
          },
          {
            path: ':network_id/tags',
            module: TagsModule,
          }
        ],
      },
    ]),
  ],
  controllers: [NetworksController],
  providers: [NetworksService],
})
export class NetworksModule {}
