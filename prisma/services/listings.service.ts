import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Category, Listing, Otp, Prisma, User } from '@prisma/client';
import { hashPassword, randomStr, slugify } from 'src/utils';
import { UUID, randomInt } from 'crypto';
import settings from 'src/config/config';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    async getByName(name: Prisma.CategoryWhereInput): Promise<Category | null> {
        const user: Category | null = await this.prisma.category.findFirst({ where: name });
        return user
    }

    async getBySlug(slug: Prisma.CategoryWhereInput): Promise<Category | null> {
        const user: Category | null = await this.prisma.category.findFirst({ where: slug });
        return user
    }

    async create(data: Prisma.CategoryCreateInput): Promise<Category> {
        var slug: string = data.slug || slugify(data.name)
        var existingSlug = await this.getBySlug(slug as Prisma.CategoryWhereInput)
        data.slug = slug
        if (existingSlug) {
            data.slug = `${slug}-${randomStr(4)}`
            return this.create(data)
        }
        const category: Category = await this.prisma.category.create({ data })
        return category
    }
}

@Injectable()
export class ListingService {
    constructor(private prisma: PrismaService) { }

    async getAll(): Promise<Listing[]> {
        const listings: Listing[] = await this.prisma.listing.findMany({ orderBy: { createdAt: 'desc' } });
        return listings
    }

    async getByAuctioneerId(auctioneerId: Prisma.ListingWhereInput): Promise<Listing[]> {
        const listings: Listing[] = await this.prisma.listing.findMany({ where: auctioneerId, orderBy: { createdAt: 'desc' } });
        return listings
    }

    async getBySlug(slug: Prisma.ListingWhereInput): Promise<Listing | null> {
        const listing: Listing | null = await this.prisma.listing.findFirst({ where: slug });
        return listing
    }

    async getRelatedListings(categoryId: UUID, slug: string): Promise<Listing[]> {
        const listings: Listing[] = await this.prisma.listing.findMany(
            { where: { categoryId, NOT: { slug } } }
        );
        return listings
    }

    async getByCategory(categoryId?: Prisma.ListingWhereInput): Promise<Listing[]> {
        const listings: Listing[] = await this.prisma.listing.findMany(
            { where: categoryId, orderBy: { createdAt: 'desc' } }
        );
        return listings
    }

    async create(data: Prisma.ListingCreateInput): Promise<Listing> {
        var slug: string = data.slug || slugify(data.name)
        var existingSlug = await this.getBySlug(slug as Prisma.ListingWhereInput)
        data.slug = slug
        if (existingSlug) {
            data.slug = `${slug}-${randomStr(4)}`
            return this.create(data)
        }
        const listing: Listing = await this.prisma.listing.create({ data })
        return listing
    }

    async update(data: Listing): Promise<Listing> {
        var slug: string = data.slug || slugify(data.name)
        var existingSlug: Listing | null = await this.prisma.listing.findFirst({ where: {slug, NOT: {id: data.id} }});
        data.slug = slug
        if (existingSlug) {
            data.slug = `${slug}-${randomStr(4)}`
            return this.update(data)
        }
        const listing: Listing = await this.prisma.listing.update({ where: { id: data.id }, data })
        return listing
    }

    timeLeftSeconds(listing: Listing): number {
        const currentDate: Date = new Date();
        const remainingTime: number = (listing.closingDate.valueOf() - currentDate.valueOf()) / 1000
        return remainingTime
    }

    timeLeft(listing: Listing): number {
        if (! listing.active) {
            return 0
        }
        return this.timeLeftSeconds(listing)
    }
}

