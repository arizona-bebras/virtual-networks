import { Module } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { ZodValidationPipe } from "nestjs-zod";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { auth } from "./auth.js";
import { DatabaseModule } from "./db/database.module.js";
import { DevicesModule } from "./modules/devices/devices.module.js";
import { NetworksModule } from "./modules/networks/networks.module.js";
import { RouterModule } from "./modules/router/router.module.js";
import { RulesModule } from "./modules/rules/rules.module.js";
import { TagsModule } from "./modules/tags/tags.module.js";

@Module({
  imports: [
    NetworksModule,
    DatabaseModule,
    DevicesModule,
    TagsModule,
    RulesModule,
    AuthModule.forRoot({
      auth,
    }),
    RouterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
