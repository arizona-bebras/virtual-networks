import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { NetworksModule } from "./modules/networks/networks.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [UsersModule, NetworksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
