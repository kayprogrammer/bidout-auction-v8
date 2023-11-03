import { Controller, Get } from '@nestjs/common';
import { SiteDetailService } from '../../prisma/services/general.service';
import { SiteDetailResponseSchema } from 'src/schemas/general';

@Controller('general/site-detail')
export class SiteDetailController {
    constructor(
        private readonly siteDetailService: SiteDetailService,
    ) {}

  @Get()
  async retrieveSiteDetails(): Promise<SiteDetailResponseSchema> {
    const siteDetail = await this.siteDetailService.get();
    return  { message: 'Site Details fetched', data: siteDetail };
  }
}
