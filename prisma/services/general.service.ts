import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { FileModel, Prisma, Review, Subscriber } from '@prisma/client';
import { excludeFields } from './utils';
import { SiteDetailSchema } from '../../src/schemas/general';

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
        const reviews: {}[] = await this.prisma.review.findMany({
            where: {
                show: true
            },
            select: {
                reviewer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                text: true
            },
        });
        return reviews as Review[]
    }

    async getCount(): Promise<number> {
        return this.prisma.review.count({
            where: {
                show: true
            }
        })

    }

    async bulkCreate(data: any): Promise<any> {
        await this.prisma.review.createMany({data})
    }

    async create(data: { [key: string]: string | boolean }): Promise<Review> {
        return await this.prisma.review.create({ data: data as any })
    }
}

@Injectable()
export class FileService {
    constructor(private prisma: PrismaService) { }

    async getLatestIds(amount: number): Promise<string[]> {
        const files: FileModel[] = await this.prisma.fileModel.findMany({orderBy: { createdAt: 'desc' }, take: amount})
        return files.map((file: FileModel) => file.id);
    }

    async create(data: Record<string,any>): Promise<FileModel> {
        return await this.prisma.fileModel.create({data: data as any})
    }
    
    async bulkCreate(data: Record<string,any>): Promise<any> {
        await this.prisma.fileModel.createMany({data: data as any})
    }

    async update(data: Record<string,any>): Promise<FileModel> {
        return await this.prisma.fileModel.update({ where: { id: data.id }, data: data})
    }

    async testFile(): Promise<FileModel> {
        const file =  await this.prisma.fileModel.create({ data: {resourceType: "image/jpeg"} })
        return file
    }
}