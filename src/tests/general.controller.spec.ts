import { GeneralController } from '../controllers/general.controller';
import { ReviewService, SiteDetailService, SubscriberService } from '../../prisma/services/general.service';
import { PrismaService } from '../prisma.service';

describe('GeneralController', () => {
  let generalController: GeneralController;
  let siteDetailService: SiteDetailService;
  let subscriberService: SubscriberService;
  let reviewService: ReviewService;

  beforeEach(() => {
    siteDetailService = new SiteDetailService(new PrismaService());
    subscriberService = new SubscriberService(new PrismaService());
    reviewService = new ReviewService(new PrismaService());
    generalController = new GeneralController(siteDetailService, subscriberService, reviewService);
  });

  describe('retrieveSiteDetails', () => {
    it('Should return site details', async () => {
      const result = await generalController.retrieveSiteDetails();

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Site Details Fetched');
      const expectedKeys: string[] = ["name", "email", "phone", "address", "fb", "tw", "wh", "ig"];
      for (const key of expectedKeys) {
        expect(Object.keys(result.data)).toContain(key);
      }
    });
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
});