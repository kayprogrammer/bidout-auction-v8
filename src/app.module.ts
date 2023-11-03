import { Module } from '@nestjs/common';
import { GeneralModule } from './modules/general.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [GeneralModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
