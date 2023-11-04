import { Module } from '@nestjs/common';
import { GeneralModule } from './modules/general.module';

@Module({
  imports: [GeneralModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
