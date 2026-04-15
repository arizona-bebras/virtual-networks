import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { NetworksModule } from "./modules/networks/networks.module";
import { UsersModule } from "./modules/users/users.module";
import { RulesModule } from './modules/rules/rules.module';
import { DatabaseModule } from './db/database.module';

@Module({
  imports: [UsersModule, NetworksModule, RulesModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
