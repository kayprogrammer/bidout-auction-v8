import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ReviewService, SiteDetailService, SubscriberService } from '../../prisma/services/general.service';
import { ReviewSchema, ReviewsResponseSchema, SiteDetailResponseSchema, SiteDetailSchema, SubscriberResponseSchema, SubscriberSchema } from '../schemas/general';
import { Response } from '../utils/responses';

@Controller('api/v8/general')
@ApiTags('General')
export class GeneralController {
  constructor(
    private readonly siteDetailService: SiteDetailService,
    private readonly subscriberService: SubscriberService,
    private readonly reviewService: ReviewService,

  ) { }

  @Get("/site-detail")
  @ApiOperation({ summary: 'Retrieve site details', description: "This endpoint retrieves few details of the site/application" })
  @ApiResponse({ status: 200, type: SiteDetailResponseSchema })
  async retrieveSiteDetails(): Promise<SiteDetailResponseSchema> {
    const siteDetail = await this.siteDetailService.get();

    // Return response
    return Response(
      SiteDetailResponseSchema, 
      'Site Details Fetched', 
      siteDetail, 
      SiteDetailSchema
    )
  }

  @Post("/subscribe")
  @ApiOperation({ summary: 'Add a subscriber', description: "This endpoint creates a newsletter subscriber in our application" })
  @ApiResponse({ status: 201, type: SubscriberResponseSchema })
  async subscribe(@Body() data: SubscriberSchema): Promise<SubscriberResponseSchema> {
    const subscriber = await this.subscriberService.getOrCreate(data);

    // Return response
    return Response(
      SubscriberResponseSchema, 
      'Subscription successful', 
      subscriber, 
      SubscriberSchema
    )
  }

  @Get("/reviews")
  @ApiOperation({ summary: 'Retrieve site reviews', description: "This endpoint retrieves few reviews of the site/application" })
  @ApiResponse({ status: 200, type: ReviewsResponseSchema })
  async retrieveReviews(): Promise<ReviewsResponseSchema> {
    const reviews = await this.reviewService.getActive();

    // Return response
    return Response(
      ReviewsResponseSchema, 
      'Reviews fetched', 
      reviews, 
      ReviewSchema
    )
  }
  
}
