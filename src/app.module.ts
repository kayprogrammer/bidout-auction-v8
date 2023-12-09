import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { GeneralModule } from './modules/general.module';
import { UserService } from '../prisma/services/accounts.service';
import { PrismaService } from './prisma.service';
import { FileService, ReviewService } from '../prisma/services/general.service';
import { CategoryService, ListingService, WatchlistService } from '../prisma/services/listings.service';
import { FileProcessor } from './utils/file_processors';
import { AuthModule } from './modules/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import settings from './config/config';
import { join } from 'path';
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter"
import { BullModule } from '@nestjs/bull';
import { SnakeCaseMiddleware } from './middlewares';
import { ListingModule } from './modules/listings.module';

@Module({
  imports: [GeneralModule, AuthModule, ListingModule,
    BullModule.forRoot({
      redis: {
        host: settings.redisHost,
        port: settings.redisPort,
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: settings.mailSenderHost,
        auth: {
          user: settings.mailSenderEmail,
          pass: settings.mailSenderPassword,
        },
        secure: true,
        port: settings.mailSenderPort
      },
      defaults: {
        from: settings.mailSenderEmail
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter()
      },
  })],
  controllers: [],
  providers: [
    UserService, 
    ReviewService, 
    WatchlistService,
    ListingService, 
    CategoryService, 
    FileService, 
    FileProcessor, 
    PrismaService
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SnakeCaseMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
