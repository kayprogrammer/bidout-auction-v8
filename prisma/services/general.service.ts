import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Review, SiteDetail, Subscriber } from '@prisma/client';


@Injectable()
export class SiteDetailService {
    constructor(private prisma: PrismaService) { }

    async get(): Promise<SiteDetail> {
        var siteDetail: Promise<SiteDetail | null> = this.prisma.siteDetail.findFirst();
        if (!siteDetail) {
            siteDetail = this.prisma.siteDetail.create({ data: {} })
        }
        return siteDetail as Promise<SiteDetail>

    }
}

@Injectable()
export class SubscriberService {
    constructor(private prisma: PrismaService) { }

    async get_by_email(email: string): Promise<Subscriber | null> {
        return this.prisma.subscriber.findFirst({
            where: {
                email
            }
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