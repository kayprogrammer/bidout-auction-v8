import { Module } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { BidService, CategoryService, ListingService, WatchlistService } from '../../prisma/services/listings.service';
import { AuthService } from '../utils/auth.service';
import { UserService } from '../../prisma/services/accounts.service';
import { FileService } from '../../prisma/services/general.service';
import { AuctioneerController } from '../controllers/auctioneer.controller';

@Module({
  imports: [],
  controllers: [AuctioneerController],
  providers: [UserService, AuthService, ListingService, BidService, PrismaService, FileService, WatchlistService, CategoryService]
})
export class AuctioneerModule { }