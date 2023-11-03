import { Module } from '@nestjs/common';
import { SiteDetailController } from '../controllers/general.controller';
import { SiteDetailService } from '../../prisma/services/general.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SiteDetailController],
  providers: [SiteDetailService, PrismaService]
})
export class GeneralModule { }