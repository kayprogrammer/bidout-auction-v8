import supertest from "supertest";
import { setupServer, teardownServer } from "./test-setup";
import { UserService } from "../../prisma/services/accounts.service";
import { PrismaService } from "../prisma.service";
import { BidService, CategoryService, ListingService, WatchlistService } from "../../prisma/services/listings.service";
import { AuthService } from "../utils/auth.service";
import { authTestGet, authTestPost, testGet } from "./utils";
import { FileService } from "../../prisma/services/general.service";
import { AuctioneerModule } from "../modules/auctioneer.module";
const listingsExpectedKeys: string[] = ["name", "auctioneer", "slug", "desc", "category", "price", "closing_date", "time_left_seconds", "active", "bids_count", "highest_bid", "image", "watchlist"];

describe('AuctioneerController', () => {
    let api: supertest.SuperTest<supertest.Test>;
    let userService: UserService;
    let watchlistService: WatchlistService;
    let authService: AuthService
    let listingService: ListingService
    let categoryService: CategoryService
    let bidService: BidService
    let fileService: FileService


    beforeAll(async () => {
        const app = await setupServer(AuctioneerModule);
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

    it('Should return listings by the current user', async () => {
        // Create Listing
        await listingService.testListing()

        // Test
        const user = await userService.testVerifiedUser()
        const result = await authTestGet(api, '/auctioneer/listings', authService, userService, user);
        expect(result.statusCode).toBe(200)
        const respBody = result.body
        expect(respBody).toHaveProperty("status", "success"); 
        expect(respBody).toHaveProperty('message', 'Auctioneer Listings fetched');
        expect(respBody.data).toHaveLength(1);
    });

    afterAll(async () => {
        await teardownServer();
    });
})
    