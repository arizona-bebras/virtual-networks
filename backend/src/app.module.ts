import { Module } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { ZodValidationPipe } from "nestjs-zod";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { auth } from "./auth";
import { DatabaseModule } from "./db/database.module";
import { DevicesModule } from "./modules/devices/devices.module";
import { NetworksModule } from "./modules/networks/networks.module";
import { RouterModule } from "./modules/router/router.module";
import { RulesModule } from "./modules/rules/rules.module";
import { TagsModule } from "./modules/tags/tags.module";

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
