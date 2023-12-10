import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from '../utils/responses';
import { ListingService } from '../../prisma/services/listings.service';
import { ListingSchema, ListingsResponseSchema } from '../schemas/listings';
import { ClientGuard } from './deps';

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
}
