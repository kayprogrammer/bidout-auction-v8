import { Module } from '@nestjs/common';
import { GeneralController } from '../controllers/general.controller';
import { ReviewService, SiteDetailService, SubscriberService } from '../../prisma/services/general.service';
import { PrismaService } from '../../src/prisma.service';

@Module({
  controllers: [GeneralController],
  providers: [SiteDetailService, SubscriberService, ReviewService, PrismaService]
})
export class GeneralModule { }