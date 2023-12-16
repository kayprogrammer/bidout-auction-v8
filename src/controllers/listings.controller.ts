import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { Response } from '../utils/responses';
import { BidService, CategoryService, ListingService, WatchlistService } from '../../prisma/services/listings.service';
import { AddListingToWatchlistResponseSchema, AddListingToWatchlistSchema, BidResponseSchema, BidSchema, BidsResponseSchema, CategoriesResponseSchema, CategorySchema, CreateBidSchema, ListingResponseDetailDataSchema, ListingResponseSchema, ListingSchema, ListingsResponseSchema } from '../schemas/listings';
import { AuthGuard, ClientGuard } from './deps';
import { RequestError } from '../exceptions.filter';
import { UserService } from '../../prisma/services/accounts.service';

@Controller('api/v8/listings')
@ApiTags('Listings')
export class ListingController {
  constructor(
    private readonly listingsService: ListingService,
    private readonly categoriesService: CategoryService,
    private readonly watchlistService: WatchlistService,
    private readonly bidsService: BidService,
    private readonly userService: UserService,
  ) { }

  @Get("/")
  @ApiOperation({ summary: 'Retrieve all listings', description: "This endpoint retrieves all listings" })
  @ApiResponse({ status: 200, type: ListingsResponseSchema })
  @ApiQuery({ name: 'quantity', required: false, type: Number, description: 'Quantity to fetch' })
  @ApiBearerAuth()
  @ApiSecurity("GuestUserId")
  @UseGuards(ClientGuard)
  async retrieveListings(@Req() req: any, @Query("quantity") quantity?: number): Promise<ListingsResponseSchema> {
    const listings = await this.listingsService.getAll(quantity, req.client.id);

    // Return response
    return Response(
        ListingsResponseSchema, 
      'Listings fetched', 
      listings, 
      ListingSchema
    )
  }

  @Get("/detail/:slug")
  @ApiOperation({ summary: "Retrieve listing's detail", description: "This endpoint retrieves detail of a listing" })
  @ApiResponse({ status: 200, type: ListingResponseSchema })
  async retrieveListingDetail(@Param("slug") slug: string): Promise<ListingResponseSchema> {
    const listing = await this.listingsService.getBySlug(slug);
    if (!listing) throw new RequestError('Listing does not exist!', 404);
    const relatedListings = await this.listingsService.getRelatedListings(listing.categoryId as string, slug)
    // Return response
    return Response(
        ListingResponseSchema, 
        'Listing details fetched', 
        {listing, relatedListings}, 
        ListingResponseDetailDataSchema
    )
  }

  @Get("/categories")
  @ApiOperation({ summary: "Retrieve all categories", description: "This endpoint retrieves all categories" })
  @ApiResponse({ status: 200, type: CategoriesResponseSchema })
  @UseGuards(ClientGuard)
  async retrieveCategories(): Promise<CategoriesResponseSchema> {
    const categories = await this.categoriesService.getAll();
    // Return response
    return Response(
        CategoriesResponseSchema, 
        'Categories fetched', 
        categories, 
        CategorySchema
    )
  }

  @Get("/categories/:slug")
  @ApiOperation({ summary: 'Retrieve all listings by category', description: "This endpoint retrieves all listings in a particular category. Use slug 'other' for category other" })
  @ApiResponse({ status: 200, type: ListingsResponseSchema })
  @ApiBearerAuth()
  @ApiSecurity("GuestUserId")
  @UseGuards(ClientGuard)
  async retrieveListingsByCategories(@Req() req: any, @Param("slug") slug: string): Promise<ListingsResponseSchema> {
    let category = null
    if (slug !== "other") {
      category = await this.categoriesService.getBySlug(slug)
      if (!category) throw new RequestError("Invalid category", 404)
      category = category.id
    }
    const listings = await this.listingsService.getByCategory(category, req.client.id)
    
    // Return response
    return Response(
        ListingsResponseSchema, 
      'Category Listings fetched', 
      listings, 
      ListingSchema
    )
  }

  @Get("/watchlist")
  @ApiOperation({ summary: 'Retrieve all listings by users watchlist', description: "This endpoint retrieves all listings in a user or guest watchlist" })
  @ApiResponse({ status: 200, type: ListingsResponseSchema })
  @ApiBearerAuth()
  @ApiSecurity("GuestUserId")
  @UseGuards(ClientGuard)
  async retrieveListingsByWatchlist(@Req() req: any): Promise<ListingsResponseSchema> {
    const watchlists = await this.watchlistService.getByClientId(req.client.id)
    const listings = watchlists.map((watchlist: Record<string, any>) => {return {...watchlist.listing, watchlist: true}})
    
    // Return response
    return Response(
      ListingsResponseSchema, 
      'Watchlists Listings fetched', 
      listings, 
      ListingSchema
    )
  }

  @Post("/watchlist")
  @ApiOperation({ summary: "Add or Remove listing from a user or guest's watchlist", description: "This endpoint adds or removes a listing from a user or guest's watchlist." })
  @ApiResponse({ status: 200, type: AddListingToWatchlistResponseSchema })
  @ApiBearerAuth()
  @ApiSecurity("GuestUserId")
  @UseGuards(ClientGuard)
  async addListingsToWatchlist(@Req() req: any, @Body() data: AddListingToWatchlistSchema, @Res({ passthrough: true }) res: any): Promise<AddListingToWatchlistResponseSchema> {
    let client = req.client 
    const slug = data.slug
    let listing = await this.listingsService.getBySlug(slug);
    if (!listing) throw new RequestError('Listing does not exist!', 404);
    const watchListData: Record<string,any> = {listingId: listing.id}
    if (client.isAuthenticated) {
      watchListData['userId'] = client.id;
    } else {
      client = await this.userService.getOrCreateGuestUser(client.id)
      watchListData['sessionKey'] = client?.id;
    }

    const watchlist = await this.watchlistService.create(watchListData)
    let respMessage = "Listing removed from user watchlist"
    let statusCode = 200 
    if(watchlist){
      respMessage = "Listing added to user watchlist"
      statusCode = 201
    }
    let guestuserId: string | null = null
    if(!client.isAuthenticated) guestuserId = client.id
    
    // Return response
    res.status(statusCode)
    return Response(
      AddListingToWatchlistResponseSchema, 
      respMessage,
      {guestuserId},
    )
  }

  @Get("/detail/:slug/bids")
  @ApiOperation({ summary: 'Retrieve bids in a listing', description: "This endpoint retrieves at most 3 bids from a particular listing" })
  @ApiResponse({ status: 200, type: BidsResponseSchema })
  @ApiBearerAuth()
  @ApiSecurity("GuestUserId")
  @UseGuards(ClientGuard)
  async retrieveListingBids(@Param("slug") slug: string): Promise<BidsResponseSchema> {
    const listing = await this.listingsService.getBySlug(slug);
    if (!listing) throw new RequestError('Listing does not exist!', 404);
    const bids = await this.bidsService.getByListingId(listing.id, 3)

    // Return response
    return Response(
      BidsResponseSchema, 
      'Listing Bids fetched', 
      bids, 
      BidSchema
    )
  }

  @Post("/detail/:slug/bids")
  @ApiOperation({ summary: 'Add a bid to a listing', description: "This endpoint adds a bid to a particular listing" })
  @ApiResponse({ status: 201, type: BidResponseSchema })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async createBid(@Req() req: any, @Param("slug") slug: string, @Body() data: CreateBidSchema): Promise<BidResponseSchema> {
    const listing = await this.listingsService.getBySlug(slug);
    if (!listing) throw new RequestError('Listing does not exist!', 404);
    const amount = data.amount
    const user = req.user
    if (user.id === listing.auctioneerId) {
      throw new RequestError("You cannot bid your own product!", 403)
    } else if (!listing.active) {
      throw new RequestError("This auction is closed!", 410)
    } else if (ListingService.timeLeft(listing) < 1) {
      throw new RequestError("This auction is expired and closed!", 410)
    } else if (amount < listing.price) {
      throw new RequestError("Bid amount cannot be less than the bidding price!")
    } else if (amount <= listing.highestBid) {
      throw new RequestError("Bid amount must be more than the highest bid!")
    }
    
    const bid = await this.bidsService.create(listing.bidsCount, {userId: user.id, listingId: listing.id, amount: amount})

    // Return response
    return Response(
      BidResponseSchema, 
      'Bid added to listing', 
      bid, 
      BidSchema
    )
  }
}

