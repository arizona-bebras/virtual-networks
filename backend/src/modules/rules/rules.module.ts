import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { RouterModule } from "../router/router.module.js";
import { RulesController } from "./rules.controller.js";
import { RulesService } from "./rules.service.js";

@Module({
  imports: [AuthModule, RouterModule],
  controllers: [RulesController],
  providers: [RulesService],
})
export class RulesModule {}
