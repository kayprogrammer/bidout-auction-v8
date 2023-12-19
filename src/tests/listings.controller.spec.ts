import supertest from "supertest";
import { ListingModule } from "../modules/listings.module";
import { setupServer, teardownServer } from "./test-setup";
import { UserService } from "../../prisma/services/accounts.service";
import { PrismaService } from "../prisma.service";
import { BidService, CategoryService, ListingService, WatchlistService } from "../../prisma/services/listings.service";
import { AuthService } from "../utils/auth.service";
import { authTestGet, authTestPost, testGet } from "./utils";
import { FileService } from "../../prisma/services/general.service";
import { Logger } from "@nestjs/common";

const listingsExpectedKeys: string[] = ["name", "auctioneer", "slug", "desc", "category", "price", "closing_date", "time_left_seconds", "active", "bids_count", "highest_bid", "image", "watchlist"];

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

        // Test
        // For invalid slug
        let result = testGet(api, '/listings/detail/invalid_slug');
        await result.expect(404)
        await result.expect((response) => {
          const respBody = response.body
          expect(respBody).toHaveProperty('status', 'failure');
          expect(respBody).toHaveProperty('message', 'Listing does not exist!');
        })

        // For valid slug
        // Get Listing
        const listing = await listingService.testListing()
        result = testGet(api, `/listings/detail/${listing.listing.slug}`);
        await result.expect(200)
        await result.expect((response) => {
          const respBody = response.body
          expect(respBody).toHaveProperty('status', 'success');
          expect(respBody).toHaveProperty('message', 'Listing details fetched');
          for (const key of listingsExpectedKeys) {
            expect(Object.keys(respBody.data)).toContain(key);
          }
        })
    });

    it('Should return categories', async () => {
        // Create Category
        const category = await categoryService.testCategory()

        // Test
        const result = testGet(api, '/listings/categories');
        await result.expect(200)
        await result.expect((response) => {
          const respBody = response.body
          expect(respBody).toHaveProperty('status', 'success');
          expect(respBody).toHaveProperty('message', 'Categories fetched');
          expect(respBody).toHaveProperty("data", [
            {name: category.name, slug: category.slug}
          ]);
        })
    });

    it('Should return listings under a category', async () => {
      // Create Category
      const category = await categoryService.testCategory()

      // Test

      // For invalid category
      let result = testGet(api, '/listings/categories/invalid_slug');
      await result.expect(404)
      await result.expect((response) => {
        const respBody = response.body
        expect(respBody).toHaveProperty('status', 'failure');
        expect(respBody).toHaveProperty('message', 'Invalid category');
      })

      // For valid category
      result = testGet(api, `/listings/categories/${category.slug}`);
      await result.expect(200)
      await result.expect((response) => {
        const respBody = response.body
        expect(respBody).toHaveProperty('status', 'success');
        expect(respBody).toHaveProperty('message', 'Category Listings fetched');
        for (const key of listingsExpectedKeys) {
          expect(Object.keys(respBody.data)).toContain(key);
        }
      })
    });

    it('Should return watchlist listings', async () => {

      // Create Watchlist
      await listingService.testWatchlist();

      // Test
      const user = await userService.testVerifiedUser();
      const result = await authTestGet(api, '/listings/watchlist', authService, userService, user);
      
      // Assertions
      expect(result.statusCode).toBe(200);
      const respBody = result.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Watchlists Listings fetched');
      expect(respBody.data).toHaveLength(1);
  });

  it('Should add listing to user watchlist', async () => {
    await watchlistService.deleteAll()
    const listing = await listingService.testListing()
    const watchlistDict = {slug: listing.slug}
    // Create Watchlist

    // Test
    const user = await userService.testVerifiedUser();
    const result = await authTestPost(api, '/listings/watchlist', authService, userService, user, watchlistDict);
    
    // Assertions
    expect(result.statusCode).toBe(201);
    const respBody = result.body
    expect(respBody).toHaveProperty('status', 'success');
    expect(respBody).toHaveProperty('message', 'Listing added to user watchlist');
    expect(respBody).toHaveProperty("data", {
      guestuser_id: null
    });
  });

  it('Should return bids in a listing', async () => {
    // Create Bid
    const listing = (await listingService.testListing()).listing
    const user = await userService.testVerifiedUser()
    await bidService.create(0, {userId: user.id, listingId: listing.id, amount: 20000})

    // Test
    const result = await authTestGet(api, `/listings/detail/${listing.slug}/bids`, authService, userService, user);
    
    // Assertions
    expect(result.statusCode).toBe(200);
    const respBody = result.body
    expect(respBody).toHaveProperty('status', 'success');
    expect(respBody).toHaveProperty('message', 'Listing Bids fetched');
    expect(respBody.data).toHaveLength(1);
  });

  afterAll(async () => {
    await teardownServer();
  });
})
