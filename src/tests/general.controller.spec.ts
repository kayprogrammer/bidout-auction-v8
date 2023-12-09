import supertest from 'supertest';
import { ReviewService } from '../../prisma/services/general.service';
import { PrismaService } from '../prisma.service';
import { UserService } from '../../prisma/services/accounts.service';
import settings from '../config/config';
import { testGet, testPost } from './utils';

import { setupServer, teardownServer } from './test-setup';
import { GeneralModule } from '../modules/general.module';

describe('GeneralController', () => {
  let api: supertest.SuperTest<supertest.Test>;
  let userService: UserService;
  let reviewService: ReviewService;

  beforeAll(async () => {
    const app = await setupServer(GeneralModule);
    api = supertest(await app.getHttpServer());

    userService = new UserService(new PrismaService());
    reviewService = new ReviewService(new PrismaService());
  });

  it('Should return site details', async () => {
    const result = testGet(api, '/general/site-detail');
    await result.expect(200)
    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Site Details Fetched');
      const expectedKeys: string[] = ["name", "email", "phone", "address", "fb", "tw", "wh", "ig"];
      for (const key of expectedKeys) {
        expect(Object.keys(respBody.data)).toContain(key);
      }
    })
  });

  it('Should successfully add email to db', async () => {
    const subscriberData = {email: "johndoe@email.com"}
    const result = testPost(api, '/general/subscribe').send(subscriberData);
    await result.expect(201)
    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Subscription successful');
      expect(respBody).toHaveProperty('data', {email: subscriberData.email});
    })
  });

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
    const result = testGet(api, '/general/reviews');
    await result.expect(200)
    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Reviews fetched');
      expect(result).toHaveProperty('data', [{
        reviewer: {name: UserService.fullName(reviewer), avatar: null},
        text: reviewDict.text
      }]);
    })
  });

  afterAll(async () => {
    await teardownServer();
  });
});