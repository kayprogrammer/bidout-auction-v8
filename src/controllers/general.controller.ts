import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { SiteDetailService } from '../../prisma/services/general.service';
import { SiteDetailResponseSchema, SiteDetailSchema } from 'src/schemas/general';
import { SiteDetail } from '@prisma/client';

@Controller('general')
@ApiTags('General')
export class GeneralController {
  constructor(
    private readonly siteDetailService: SiteDetailService,
  ) { }

  @Get("/site-detail")
  @ApiOperation({ summary: 'Retrieve site details', description: "This endpoint retrieves few details of the site/application" })
  @ApiResponse({ status: 200 })
  async retrieveSiteDetails(): Promise<SiteDetailResponseSchema> {
    const siteDetail = await this.siteDetailService.get();

    // Return response
    const resp = new SiteDetailResponseSchema()
    resp.message = 'Site Details fetched'
    resp.data = siteDetail
    return resp
  }
}
