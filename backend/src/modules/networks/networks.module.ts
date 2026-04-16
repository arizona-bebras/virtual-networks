import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { DevicesModule } from "../devices/devices.module";
import { RulesModule } from "../rules/rules.module";
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
      {
        path: "networks/:network_id/rules",
        module: RulesModule,
      },
    ]),
  ],
  controllers: [NetworksController],
  providers: [NetworksService],
})
export class NetworksModule {}
