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

@Controller('api/v8/auctioneer')
@ApiTags('Auctioneer')
export class AuctioneerController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly listingsService: ListingService,
    private readonly bidsService: BidService,
    private readonly fileService: FileService,

  ) { }

  @Get("/listings")
  @ApiOperation({ summary: 'Retrieve all listings by the current user', description: "This endpoint retrieves all listings by the current user" })
  @ApiResponse({ status: 200, type: ListingsResponseSchema })
  @ApiQuery({ name: 'quantity', required: false, type: Number, description: 'Quantity to fetch' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
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
}