import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Review, Subscriber } from '@prisma/client';
import { excludeFields } from './utils';
import { SiteDetailSchema } from 'src/schemas/general';


@Injectable()
export class SiteDetailService {
    constructor(private prisma: PrismaService) { }

    async get(): Promise<SiteDetailSchema> {
        var siteDetail: SiteDetailSchema | null = await this.prisma.siteDetail.findFirst({ select: excludeFields('SiteDetail', ["id", "createdAt", "updatedAt"]) });
        if (!siteDetail) {
            siteDetail = await this.prisma.siteDetail.create({ data: {} })
        }

        return siteDetail

    }
}

@Injectable()
export class SubscriberService {
    constructor(private prisma: PrismaService) { }

    async get_by_email(email: Prisma.SubscriberWhereUniqueInput): Promise<Subscriber | null> {
        return this.prisma.subscriber.findUnique({
            where: email
        });
    }
}

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) { }

    async get_active(): Promise<Review[]> {
        return this.prisma.review.findMany({
            where: {
                show: true
            }
        });
    }

    async get_count(): Promise<number> {
        return this.prisma.review.count({
            where: {
                show: true
            }
        })

    }
}