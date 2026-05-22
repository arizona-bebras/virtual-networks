import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { DevicesController } from "./devices.controller.js";
import { DevicesService } from "./devices.service.js";
import { WireguardCfgService } from "./wireguardcfg.service.js";

@Module({
  imports: [AuthModule],
  controllers: [DevicesController],
  providers: [DevicesService, WireguardCfgService],
})
export class DevicesModule {}
