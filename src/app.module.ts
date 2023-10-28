import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import settings from './config/config'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: settings.postgresServer,
      port: settings.postgresPort,
      username: settings.postgresUser,
      password: settings.postgresPassword,
      database: settings.postgresDb,
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
