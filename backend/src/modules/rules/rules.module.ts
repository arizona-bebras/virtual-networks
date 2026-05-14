import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { RulesController } from "./rules.controller.js";
import { RulesService } from "./rules.service.js";

@Module({
  imports: [AuthModule],
  controllers: [RulesController],
  providers: [RulesService],
})
export class RulesModule {}
