import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
  imports: [AuthModule],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
