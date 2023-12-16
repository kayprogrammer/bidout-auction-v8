import { Module } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { ListingController } from '../controllers/listings.controller';
import { BidService, CategoryService, ListingService, WatchlistService } from '../../prisma/services/listings.service';
import { AuthService } from '../utils/auth.service';
import { UserService } from '../../prisma/services/accounts.service';
import { FileService } from '../../prisma/services/general.service';

@Module({
  imports: [],
  controllers: [ListingController],
  providers: [UserService, AuthService, WatchlistService, ListingService, CategoryService, BidService, PrismaService, FileService]
})
export class ListingModule { }