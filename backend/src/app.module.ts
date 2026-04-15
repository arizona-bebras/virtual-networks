import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { NetworksModule } from './modules/networks/networks.module';

@Module({
  imports: [UsersModule, NetworksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
