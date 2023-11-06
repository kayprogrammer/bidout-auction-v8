import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Review, Subscriber } from '@prisma/client';
import { excludeFields } from './utils';
import { SiteDetailSchema } from 'src/schemas/general';

var fieldsToExclude: any[] = ["id", "createdAt", "updatedAt"]

@Injectable()
export class SiteDetailService {
    constructor(private prisma: PrismaService) { }

    async get(): Promise<SiteDetailSchema> {
        var siteDetail: {} | null = await this.prisma.siteDetail.findFirst({ select: excludeFields('SiteDetail', fieldsToExclude) });
        if (!siteDetail) {
            siteDetail = await this.prisma.siteDetail.create({ data: {} })
        }

        return siteDetail as SiteDetailSchema

    }
}

@Injectable()
export class SubscriberService {
    constructor(private prisma: PrismaService) { }

    async getOrCreate(email: Prisma.SubscriberCreateInput): Promise<Subscriber> {
        var fieldsToSelect = {email: true}
        var subscriber: {} | null = await this.prisma.subscriber.findFirst({
            where: email, select: fieldsToSelect
        });
        if (!subscriber) {
            subscriber = await this.prisma.subscriber.create({ data: email, select: fieldsToSelect})
        }
        return subscriber as Subscriber
    }
}

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) { }

    async getActive(): Promise<Review[]> {
        return this.prisma.review.findMany({
            where: {
                show: true
            }
        });
    }

    async getCount(): Promise<number> {
        return this.prisma.review.count({
            where: {
                show: true
            }
        })

    }
}