import { Module } from '@nestjs/common';
import { GeneralModule } from './modules/general.module';
import { UserService } from '../prisma/services/accounts.service';
import { PrismaService } from './prisma.service';
import { FileService, ReviewService } from '../prisma/services/general.service';
import { CategoryService, ListingService } from '../prisma/services/listings.service';
import { FileProcessor } from './utils/file_processors';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [GeneralModule, AuthModule],
  controllers: [],
  providers: [
    UserService, 
    ReviewService, 
    ListingService, 
    CategoryService, 
    FileService, 
    FileProcessor, 
    PrismaService
  ],
})
export class AppModule { }
