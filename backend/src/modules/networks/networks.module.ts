import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { RouterModule } from "../router/router.module.js";
import { NetworksController } from "./networks.controller.js";
import { NetworksService } from "./networks.service.js";

@Module({
  imports: [AuthModule, RouterModule],
  controllers: [NetworksController],
  providers: [NetworksService],
})
export class NetworksModule {}
