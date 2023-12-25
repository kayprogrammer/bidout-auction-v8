import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from '../utils/responses';
import { BidService, CategoryService, ListingService } from '../../prisma/services/listings.service';
import { BidResponseDataSchema, BidsResponseSchema, ListingSchema, ListingsResponseSchema } from '../schemas/listings';
import { AuthGuard } from './deps';
import { RequestError } from '../exceptions.filter';
import { UserService } from '../../prisma/services/accounts.service';
import { FileService } from '../../prisma/services/general.service';
import { CreateListingResponseDataSchema, CreateListingResponseSchema, CreateListingSchema, ProfileDataSchema, ProfileResponseSchema, UpdateListingSchema, UpdateProfileResponseDataSchema, UpdateProfileResponseSchema, UpdateProfileSchema } from '../schemas/auctioneer';
import { Category, FileModel } from '@prisma/client';
import { removeKeys, removeNullValues } from '../utils/utils';

@Controller('api/v8/auctioneer')
@ApiTags('Auctioneer')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AuctioneerController {
  constructor(
    private readonly userService: UserService,
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
    let listing = await this.listingsService.getBySlug(slug);
    if (!listing) throw new RequestError('Listing does not exist!', 404);
    if (auctioneer.id !== listing.auctioneerId) throw new RequestError("This listing doesn't belong to you!");
    let categorySlug = data.category
    let category: Category | null

    let dataToUpdate: Record<string,any> = removeNullValues(data)

    if(categorySlug) {
      if(categorySlug !== "other") {
        category = await this.categoryService.getBySlug(categorySlug)
        if (!category) throw new RequestError("Invalid Entry", 422, {category: "Invalid Category"})
      } else {
        category = null
      }
      dataToUpdate = removeKeys(data, "category")
      dataToUpdate.categoryId = null
      if (category) dataToUpdate.categoryId = category.id
    }

    const fileType = data.fileType
    if(fileType) {
      let file: FileModel
      if(listing.imageId) {
        file = await this.fileService.update({id: listing.imageId, resourceType: fileType})
      } else {
        file = await this.fileService.create({resourceType: fileType})
      }
      dataToUpdate = removeKeys(dataToUpdate, "fileType")
      dataToUpdate.imageId = file.id
    }

    // Update listing
    dataToUpdate.id = listing.id
    listing = await this.listingsService.update(dataToUpdate)
    const listingDict: Record<string,any> = { ...listing }

    listingDict.fileUpload = false
    if (fileType) listingDict.fileUpload = true

    // Return response
    return Response(
      CreateListingResponseSchema, 
      'Listing updated successfully', 
      listingDict, 
      CreateListingResponseDataSchema
    )
  }

  @Get("/listings/:slug/bids")
  @ApiOperation({ summary: 'Retrieve all bids in a listing (current user)', description: "This endpoint retrieves all bids in a particular listing by the current user." })
  @ApiResponse({ status: 200, type: BidsResponseSchema })
  async retrieveAuctioneerListingBids(@Req() req: any, @Param("slug") slug: string): Promise<BidsResponseSchema> {
    const auctioneer = req.user
    const listing = await this.listingsService.getBySlug(slug);
    if (!listing) throw new RequestError('Listing does not exist!', 404);
    if (listing.auctioneerId !== auctioneer.id) throw new RequestError("This listing doesn't belong to you!");

    const bids = await this.bidsService.getByListingId(listing.id)

    // Return response
    return Response(
      BidsResponseSchema, 
      'Listing Bids fetched', 
      {listing: listing.name, bids}, 
      BidResponseDataSchema
    )
  }

  @Get("")
  @ApiOperation({ summary: 'Get Profile', description: "This endpoint gets the current user's profile." })
  @ApiResponse({ status: 200, type: ProfileResponseSchema })
  async retrieveProfile(@Req() req: any): Promise<ProfileResponseSchema> {
    // Return response
    return Response(
      ProfileResponseSchema, 
      'User details fetched!', 
      req.user, 
      ProfileDataSchema
    )
  }

  @Put("")
  @ApiOperation({ summary: 'Update Profile', description: "This endpoint updates an authenticated user's profile. Note: Use the returned file_upload_data to upload avatar to cloudinary" })
  @ApiResponse({ status: 200, type: UpdateProfileResponseSchema })
  async updateProfile(@Req() req: any, @Body() data: UpdateProfileSchema): Promise<UpdateProfileResponseSchema> {
    let user = req.user
    let dataToUpdate: Record<string,any> = removeNullValues(data)
    const fileType = data.fileType
    if(fileType) {
      let file: FileModel
      if(user.avatarId) {
        file = await this.fileService.update({id: user.avatarId, resourceType: fileType})
      } else {
        file = await this.fileService.create({resourceType: fileType})
      }
      dataToUpdate = removeKeys(dataToUpdate, "fileType")
      dataToUpdate.avatarId = file.id
    }

    // Update user profile
    dataToUpdate.id = user.id
    user = await this.userService.update(dataToUpdate)
    const userDict: Record<string,any> = { ...user }

    userDict.fileUpload = false
    if (fileType) userDict.fileUpload = true

    // Return response
    return Response(
      UpdateProfileResponseSchema, 
      'User updated!', 
      userDict, 
      UpdateProfileResponseDataSchema
    )
  }
}
