import { GeneralController } from '../controllers/general.controller';
import { SiteDetailService, SubscriberService, ReviewService } from '../../prisma/services/general.service';
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
    it('should return site details', async () => {
      const result = {
        status: 'success',
        message: 'Site Details Fetched'
      };
      // jest.spyOn(generalController, 'retrieveSiteDetails').mockImplementation(() => result);

      expect(await generalController.retrieveSiteDetails()).toHaveProperty("status", "success");
      expect(await generalController.retrieveSiteDetails()).toHaveProperty("message", "Site Details Fetched");
    });
  });
});