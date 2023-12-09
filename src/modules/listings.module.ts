import { Module } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { ListingController } from '../controllers/listings.controller';
import { ListingService } from '../../prisma/services/listings.service';

@Module({
  imports: [],
  controllers: [ListingController],
  providers: [ListingService, PrismaService]
})
export class ListingModule { }