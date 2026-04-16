import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { DevicesModule } from "../devices/devices.module";
import { TagsModule } from "../tags/tags.module";
import { NetworksController } from "./networks.controller";
import { NetworksService } from "./networks.service";

@Module({
  imports: [
    DevicesModule,
    TagsModule,
    RouterModule.register([
      {
        path: "network/:network_id/devices",
        module: DevicesModule,
      },
      {
        path: "network/:network_id/tags",
        module: TagsModule,
      },
    ]),
  ],
  controllers: [NetworksController],
  providers: [NetworksService],
})
export class NetworksModule {}
