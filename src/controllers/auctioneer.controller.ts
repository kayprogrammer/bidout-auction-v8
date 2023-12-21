import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from '../utils/responses';
import { BidService, CategoryService, ListingService, WatchlistService } from '../../prisma/services/listings.service';
import { BidSchema, BidsResponseSchema, ListingSchema, ListingsResponseSchema } from '../schemas/listings';
import { AuthGuard } from './deps';
import { RequestError } from '../exceptions.filter';
import { UserService } from '../../prisma/services/accounts.service';
import { AuthService } from '../utils/auth.service';
import { FileService } from '../../prisma/services/general.service';
import { CreateListingResponseDataSchema, CreateListingResponseSchema, CreateListingSchema } from '../schemas/auctioneer';
import { Category } from '@prisma/client';

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
  @ApiBearerAuth()
  async createListing(@Req() req: any, @Param("slug") slug: string, @Body() data: CreateListingSchema): Promise<CreateListingResponseSchema> {
    let categorySlug = data.category
    let category: Promise<Category | null> = null

    const fileType = data.fileType
    if(categorySlug !== "other") {
      category = await this.categoryService.getBySlug(categorySlug)
    }
    // Return response
    return Response(
      CreateListingResponseSchema, 
      'Listing created successfully', 
      listing, 
      CreateListingResponseDataSchema
    )
  }
}