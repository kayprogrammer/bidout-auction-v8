import * as request from 'supertest';
import { GeneralController } from '../controllers/general.controller';
import { ReviewService, SiteDetailService, SubscriberService } from '../../prisma/services/general.service';
import { PrismaService } from '../prisma.service';
import { UserService } from '../../prisma/services/accounts.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GeneralModule } from '../modules/general.module';
import settings from '../config/config';

describe('GeneralController', () => {
  let app: INestApplication;
  let generalController: GeneralController;
  let userService: UserService;
  let siteDetailService: SiteDetailService;
  let subscriberService: SubscriberService;
  let reviewService: ReviewService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GeneralModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    // userService = new UserService(new PrismaService());
    // siteDetailService = new SiteDetailService(new PrismaService());
    // subscriberService = new SubscriberService(new PrismaService());
    // reviewService = new ReviewService(new PrismaService());
    // generalController = new GeneralController(siteDetailService, subscriberService, reviewService);
  });

  it('Should return site details', async () => {
    const result = await request(app.getHttpServer().get("/site-detail")) //await generalController.retrieveSiteDetails();

    
    expect(result).toHaveProperty('status', 'success');
    expect(result).toHaveProperty('message', 'Site Details Fetched');
    const expectedKeys: string[] = ["name", "email", "phone", "address", "fb", "tw", "wh", "ig"];
    for (const key of expectedKeys) {
      expect(Object.keys(result.data)).toContain(key);
    }
  });

  describe('subscribe', () => {
    it('Should successfully add email to db', async () => {
      const subscriberData = {email: "johndoe@email.com"}
      const result = await generalController.subscribe(subscriberData);

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Subscription successful');
      expect(result).toHaveProperty('data', {email: subscriberData.email});
    });
  });

  describe('retrieveReviews', () => {
    it('Should return reviews', async () => {
      // Create Reviewer
      const userDict = {
        firstName: "Test",
        lastName: "Reviewer",
        email: settings.firstReviewerEmail,
        password: settings.firstReviewerPassword,
        isEmailVerified: true
      }
      const reviewer = await userService.create(userDict)

      // Create Review
      const reviewDict = {reviewerId: reviewer.id, text: "New review", show: true}
      await reviewService.create(reviewDict)

      // Test
      const result = await generalController.retrieveReviews();
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Reviews fetched');
      expect(result).toHaveProperty('data', [{
        reviewer: {name: userService.fullName(reviewer), avatar: null},
        text: reviewDict.text
      }]);
    });
  });
  afterAll(async () => {
    await app.close();
  });
});