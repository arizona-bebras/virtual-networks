import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { NetworksModule } from './modules/networks/networks.module';
import { TagsModule } from './modules/tags/tags.module';
import { DevicesModule } from './modules/devices/devices.module';

@Module({
  imports: [UsersModule, NetworksModule, TagsModule, DevicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
