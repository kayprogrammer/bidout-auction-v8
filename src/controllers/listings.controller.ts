import { Body, Controller, Get, Logger, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from '../utils/responses';
import { ListingService } from '../../prisma/services/listings.service';
import { ListingResponseDetailDataSchema, ListingResponseSchema, ListingSchema, ListingsResponseSchema } from '../schemas/listings';
import { ClientGuard } from './deps';
import { RequestError } from '../exceptions.filter';
import { Listing } from '@prisma/client';

@Controller('api/v8/listings')
@ApiTags('Listings')
export class ListingController {
  constructor(
    private readonly listingsService: ListingService,

  ) { }

  @Get("/")
  @ApiOperation({ summary: 'Retrieve all listings', description: "This endpoint retrieves all listings" })
  @ApiResponse({ status: 200, type: ListingsResponseSchema })
  @ApiQuery({ name: 'quantity', required: false, type: Number, description: 'Quantity to fetch' })
  @UseGuards(ClientGuard)
  async retrieveListings(@Req() req: any, @Query("quantity") quantity?: number): Promise<ListingsResponseSchema> {
  const listings = await this.listingsService.getAll(quantity, req.client?.id);
    // Return response
    return Response(
        ListingsResponseSchema, 
      'Listings fetched', 
      listings, 
      ListingSchema
    )
  }

  @Get("/:slug")
  @ApiOperation({ summary: "Retrieve listing's detail", description: "This endpoint retrieves detail of a listing" })
  @ApiResponse({ status: 200, type: ListingResponseSchema })
  @UseGuards(ClientGuard)
  async retrieveListingDetail(@Param("slug") slug: string): Promise<ListingResponseSchema> {
    let listing = await this.listingsService.getBySlug(slug);
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
}
