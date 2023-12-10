import { Module } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { ListingController } from '../controllers/listings.controller';
import { ListingService, WatchlistService } from '../../prisma/services/listings.service';
import { AuthService } from '../utils/auth.service';
import { UserService } from '../../prisma/services/accounts.service';

@Module({
  imports: [],
  controllers: [ListingController],
  providers: [UserService, AuthService, WatchlistService, ListingService, PrismaService]
})
export class ListingModule { }