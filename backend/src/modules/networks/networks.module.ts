import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { NetworksController } from "./networks.controller.js";
import { NetworksService } from "./networks.service.js";
import { WireguardCfgService } from "./wireguardcfg.service.js";

@Module({
  imports: [AuthModule],
  controllers: [NetworksController],
  providers: [NetworksService, WireguardCfgService],
})
export class NetworksModule {}
