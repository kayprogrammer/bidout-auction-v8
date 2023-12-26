import supertest from "supertest";
import { setupServer, teardownServer } from "./test-setup";
import { UserService } from "../../prisma/services/accounts.service";
import { PrismaService } from "../prisma.service";
import { BidService, CategoryService, ListingService, WatchlistService } from "../../prisma/services/listings.service";
import { AuthService } from "../utils/auth.service";
import { authTestGet, authTestPost } from "./utils";
import { FileService } from "../../prisma/services/general.service";
import { AuctioneerModule } from "../modules/auctioneer.module";
import { error } from "console";
const listingsExpectedKeys: string[] = ["name", "auctioneer", "slug", "desc", "category", "price", "closing_date", "time_left_seconds", "active", "bids_count", "highest_bid", "file_upload_data"];

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

    it('Should create a listing', async () => {
        const category = await categoryService.testCategory()
        const listingDict = {
            name: "Test Listing",
            desc: "Test description",
            category: category.slug,
            price: 1000.00,
            closingDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            fileType: "image/jpeg",
        }
    
        // Test
        const user = await userService.testVerifiedUser();
        let result = await authTestPost(api, `/auctioneer/listings`, authService, userService, user, listingDict);
        
        // Assertions
        expect(result.statusCode).toBe(201);
        let respBody = result.body
        expect(respBody).toHaveProperty('status', 'success');
        expect(respBody).toHaveProperty('message', 'Listing created successfully');
        for (const key of listingsExpectedKeys) {
            expect(Object.keys(respBody.data)).toContain(key);
        }

        // Test if error is returned because of invalid category
        listingDict.category = "invalid-category"
        result = await authTestPost(api, `/auctioneer/listings`, authService, userService, user, listingDict);
        
        // Assertions
        expect(result.statusCode).toBe(422);
        respBody = result.body
        expect(respBody).toHaveProperty('message', 'Invalid Entry');
        expect(respBody.data).toHaveProperty('category', 'Invalid Category');
    });

    afterAll(async () => {
        await teardownServer();
    });
})
    