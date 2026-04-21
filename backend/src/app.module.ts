import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { auth } from "./auth";
import { RolesGuard } from "./authorization/roles.guard";
import { DatabaseModule } from "./db/database.module";
import { DevicesModule } from "./modules/devices/devices.module";
import { NetworksModule } from "./modules/networks/networks.module";
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
