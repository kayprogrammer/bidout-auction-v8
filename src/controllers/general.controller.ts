import { Body, ClassSerializerInterceptor, Controller, Get, Logger, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ReviewService, SiteDetailService, SubscriberService } from '../../prisma/services/general.service';
import { ReviewSchema, ReviewsResponseSchema, SiteDetailResponseSchema, SubscriberResponseSchema, SubscriberSchema } from '../schemas/general';
import { plainToClass } from 'class-transformer';
import { Review } from '@prisma/client';

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
    const resp = new SiteDetailResponseSchema()
    resp.message = 'Site Details fetched'
    resp.data = siteDetail
    return resp
  }

  @Post("/subscribe")
  @ApiOperation({ summary: 'Add a subscriber', description: "This endpoint creates a newsletter subscriber in our application" })
  @ApiResponse({ status: 201, type: SubscriberResponseSchema })
  async subscribe(@Body() data: SubscriberSchema): Promise<SubscriberResponseSchema> {
    const subscriber = await this.subscriberService.getOrCreate(data);

    // Return response
    const resp = new SubscriberResponseSchema()
    resp.message = 'Subscription successful'
    resp.data = subscriber
    return resp
  }

  @Get("/reviews")
  @ApiOperation({ summary: 'Retrieve site reviews', description: "This endpoint retrieves few reviews of the site/application" })
  @ApiResponse({ status: 200, type: ReviewsResponseSchema })
  async retrieveReviews(): Promise<ReviewsResponseSchema> {
    const reviews = await this.reviewService.getActive();

    // Return response
    const resp = new ReviewsResponseSchema()
    resp.message = 'Reviews fetched'
    resp.data = reviews as any
    Logger.log(plainToClass(ReviewSchema, reviews, {strategy: 'excludeAll'}))
    // resp.data = plainToClass(ReviewSchema, reviews, {strategy: 'excludeAll'})
    return resp
  }
  
}
