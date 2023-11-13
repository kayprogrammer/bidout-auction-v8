import { GeneralController } from '../controllers/general.controller';
import { ReviewService, SiteDetailService, SubscriberService } from '../../prisma/services/general.service';
import { PrismaService } from '../prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { Logger } from '@nestjs/common';
import { createTestingModuleForService } from './testing.setup';

describe('GeneralController', () => {
  let generalController: GeneralController;
  let siteDetailService: SiteDetailService;
  let subscriberService: SubscriberService;
  let reviewService: ReviewService;
  let mockPrisma: DeepMockProxy<PrismaClient>;

  beforeEach(async() => {
    const module = await createTestingModuleForService(SiteDetailService);
    const prismaService = new PrismaService()
    siteDetailService = new SiteDetailService(prismaService);
    generalController = new GeneralController(siteDetailService, subscriberService, reviewService);
  });

  describe('retrieveSiteDetails', () => {
    it('Should return site details', async () => {
      const result = await generalController.retrieveSiteDetails();
      Logger.log("result.message")

      // expect(result.status).toBe(200);
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Site Details Fetched');
      // const expectedKeys: string[] = ["name", "email", "phone", "address", "fb", "tw", "wh", "ig"];
      // for (const key of expectedKeys) {
      //   expect(Object.keys(result.data)).toContain(key);
      // }
    });
  });
});
