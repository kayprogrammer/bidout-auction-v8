import supertest from "supertest";
import { ListingModule } from "../modules/listings.module";
import { setupServer, teardownServer } from "./test-setup";
import { UserService } from "../../prisma/services/accounts.service";
import { PrismaService } from "../prisma.service";
import { BidService, CategoryService, ListingService, WatchlistService } from "../../prisma/services/listings.service";
import { AuthService } from "../utils/auth.service";
import { testGet } from "./utils";
import { FileService } from "../../prisma/services/general.service";

describe('ListingsController', () => {
    let api: supertest.SuperTest<supertest.Test>;
    let userService: UserService;
    let watchlistService: WatchlistService;
    let authService: AuthService
    let listingService: ListingService
    let categoryService: CategoryService
    let bidService: BidService
    let fileService: FileService


    beforeAll(async () => {
        const app = await setupServer(ListingModule);
        api = supertest(await app.getHttpServer());
        const prismaService = new PrismaService();
        userService = new UserService(prismaService);
        watchlistService = new WatchlistService(prismaService);
        categoryService = new CategoryService(prismaService);
        fileService = new FileService(prismaService);

        authService = new AuthService(userService);
        listingService = new ListingService(prismaService, watchlistService, userService, categoryService, fileService);
        bidService = new BidService(prismaService, listingService);

    });

    it('Should return listings', async () => {

        // Create Listing
        await listingService.testListing()

        // Test
        const result = testGet(api, '/listings');
        await result.expect(200)
        await result.expect((response) => {
          const respBody = response.body
          expect(respBody).toHaveProperty('status', 'success');
          expect(respBody).toHaveProperty('message', 'Listings fetched');
          expect(respBody.data).toHaveLength(1);
        })
    });

    it('Should return listing detail', async () => {

        // Create Listing
        await listingService.testListing()

        // Test
        const result = testGet(api, '/listings');
        await result.expect(200)
        await result.expect((response) => {
          const respBody = response.body
          expect(respBody).toHaveProperty('status', 'success');
          expect(respBody).toHaveProperty('message', 'Listings fetched');
          expect(respBody.data).toHaveLength(1);
        })
    });

    afterAll(async () => {
        await teardownServer();
    });
})
