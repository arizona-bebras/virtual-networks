import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { RulesController } from "./rules.controller";
import { RulesService } from "./rules.service";

@Module({
  imports: [AuthModule],
  controllers: [RulesController],
  providers: [RulesService],
})
export class RulesModule {}
