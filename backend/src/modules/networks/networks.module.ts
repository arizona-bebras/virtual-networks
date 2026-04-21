import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { NetworksController } from "./networks.controller";
import { NetworksService } from "./networks.service";

@Module({
  imports: [AuthModule],
  controllers: [NetworksController],
  providers: [NetworksService],
})
export class NetworksModule {}
