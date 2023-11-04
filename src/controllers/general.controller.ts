import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { SiteDetailService, SubscriberService } from '../../prisma/services/general.service';
import { SiteDetailResponseSchema, SiteDetailSchema, SubscriberResponseSchema, SubscriberSchema } from 'src/schemas/general';
import { validate } from 'class-validator';

@Controller('api/v1/general')
@ApiTags('General')
export class GeneralController {
  constructor(
    private readonly siteDetailService: SiteDetailService,
    private readonly subscriberService: SubscriberService,
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
}
