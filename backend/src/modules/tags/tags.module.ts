import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { TagsController } from "./tags.controller.js";
import { TagsService } from "./tags.service.js";

@Module({
  imports: [AuthModule],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
