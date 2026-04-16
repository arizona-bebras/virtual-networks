import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./db/database.module";
import { DevicesModule } from "./modules/devices/devices.module";
import { NetworksModule } from "./modules/networks/networks.module";
import { RulesModule } from "./modules/rules/rules.module";
import { TagsModule } from "./modules/tags/tags.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    UsersModule,
    NetworksModule,
    DatabaseModule,
    DevicesModule,
    TagsModule,
    RulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
