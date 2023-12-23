import { Body, Controller, Get, Logger, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from '../utils/responses';
import { BidService, CategoryService, ListingService, WatchlistService } from '../../prisma/services/listings.service';
import { BidSchema, BidsResponseSchema, ListingSchema, ListingsResponseSchema } from '../schemas/listings';
import { AuthGuard } from './deps';
import { RequestError } from '../exceptions.filter';
import { UserService } from '../../prisma/services/accounts.service';
import { AuthService } from '../utils/auth.service';
import { FileService } from '../../prisma/services/general.service';
import { CreateListingResponseDataSchema, CreateListingResponseSchema, CreateListingSchema, UpdateListingSchema } from '../schemas/auctioneer';
import { Category } from '@prisma/client';
import { removeKeys } from '../utils/utils';

@Controller('api/v8/auctioneer')
@ApiTags('Auctioneer')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AuctioneerController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly listingsService: ListingService,
    private readonly categoryService: CategoryService,
    private readonly bidsService: BidService,
    private readonly fileService: FileService,

  ) { }

  @Get("/listings")
  @ApiOperation({ summary: 'Retrieve all listings by the current user', description: "This endpoint retrieves all listings by the current user" })
  @ApiResponse({ status: 200, type: ListingsResponseSchema })
  @ApiQuery({ name: 'quantity', required: false, type: Number, description: 'Quantity to fetch' })
  async retrieveAuctioneerListings(@Req() req: any, @Query("quantity") quantity?: number): Promise<ListingsResponseSchema> {
    const listings = await this.listingsService.getByAuctioneerId(req.user.id, quantity);
    // Return response
    return Response(
        ListingsResponseSchema, 
      'Auctioneer Listings fetched', 
      listings, 
      ListingSchema
    )
  }

  @Post("/listings")
  @ApiOperation({ summary: 'Create a listing', description: "This endpoint creates a new listing. Note: Use the returned file_upload_data to upload image to cloudinary" })
  @ApiResponse({ status: 201, type: CreateListingResponseSchema })
  async createListing(@Req() req: any, @Body() data: CreateListingSchema): Promise<CreateListingResponseSchema> {
    const auctioneer = req.user
    let categorySlug = data.category
    let category: Category | null

    if(categorySlug !== "other") {
      category = await this.categoryService.getBySlug(categorySlug)
      if (!category) throw new RequestError("Invalid Entry", 422, {category: "Invalid Category"})
    } else {
      category = null
    }

    // Create File Object
    const file = await this.fileService.create({resourceType: data.fileType})

    // Create listing
    const dataToCreate = removeKeys(data, "category", "fileType")
    dataToCreate.imageId = file.id
    dataToCreate.auctioneerId = auctioneer.id
    dataToCreate.categoryId = null
    if (category) dataToCreate.categoryId = category.id
    const listing = await this.listingsService.create(dataToCreate)
 
    // Return response
    return Response(
      CreateListingResponseSchema, 
      'Listing created successfully', 
      listing, 
      CreateListingResponseDataSchema
    )
  }

  @Patch("/listings/:slug")
  @ApiOperation({ summary: 'Update a listing', description: "This endpoint updates a listing. Note: Use the returned file_upload_data to upload image to cloudinary" })
  @ApiResponse({ status: 200, type: CreateListingResponseSchema })
  async updateListing(@Req() req: any, @Param("slug") slug: string, @Body() data: UpdateListingSchema): Promise<CreateListingResponseSchema> {
    const auctioneer = req.user
    const listing = await this.listingsService.getBySlug(slug);
    if (!listing) throw new RequestError('Listing does not exist!', 404);
    if (auctioneer.id !== listing.auctioneerId) throw new RequestError("This listing doesn't belong to you!");
    Logger.log(data)
    // let categorySlug = data.category
    // let category: Category | null

    // if(categorySlug !== "other") {
    //   category = await this.categoryService.getBySlug(categorySlug)
    //   if (!category) throw new RequestError("Invalid Entry", 422, {category: "Invalid Category"})
    // } else {
    //   category = null
    // }

    // // Create File Object
    // const file = await this.fileService.create({resourceType: data.fileType})

    // // Create listing
    // const dataToCreate = removeKeys(data, "category", "fileType")
    // dataToCreate.imageId = file.id
    // dataToCreate.auctioneerId = auctioneer.id
    // dataToCreate.categoryId = null
    // if (category) dataToCreate.categoryId = category.id
    // const listing = await this.listingsService.create(dataToCreate)
 
    // Return response
    return Response(
      CreateListingResponseSchema, 
      'Listing created successfully', 
      listing, 
      CreateListingResponseDataSchema
    )
  }
}