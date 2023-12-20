import { Module } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { ListingController } from '../controllers/listings.controller';
import { BidService, ListingService } from '../../prisma/services/listings.service';
import { AuthService } from '../utils/auth.service';
import { UserService } from '../../prisma/services/accounts.service';
import { FileService } from '../../prisma/services/general.service';

@Module({
  imports: [],
  controllers: [ListingController],
  providers: [UserService, AuthService, ListingService, BidService, PrismaService, FileService]
})
export class AuctioneerModule { }