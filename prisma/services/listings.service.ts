import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Bid, Category, Listing, Prisma, Watchlist } from '@prisma/client';
import { randomStr, slugify } from 'src/utils/utils';
import { UUID } from 'crypto';

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

    async getAllIds(): Promise<string[]> {
        const categories: {id: string}[] = await this.prisma.category.findMany({select: {id: true}}) 
        return categories.map((category) => {category.id}) as unknown as string[]
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

    async bulkCreate(data: any): Promise<string[]> {
        const categories: any = await this.prisma.category.createMany({data, skipDuplicates: true})
        return categories.map((category: Category) => {category.id})
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

    async getCount(): Promise<number> {
        return this.prisma.listing.count()
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
        var existingSlug: Listing | null = await this.prisma.listing.findFirst({ where: { slug, NOT: { id: data.id } } });
        data.slug = slug
        if (existingSlug) {
            data.slug = `${slug}-${randomStr(4)}`
            return this.update(data)
        }
        const listing: Listing = await this.prisma.listing.update({ where: { id: data.id }, data })
        return listing
    }

    async bulkCreate(data: any): Promise<Prisma.BatchPayload> {
        return await this.prisma.listing.createMany({data, skipDuplicates: true})
    }

    timeLeftSeconds(listing: Listing): number {
        const currentDate: Date = new Date();
        const remainingTime: number = (listing.closingDate.valueOf() - currentDate.valueOf()) / 1000
        return remainingTime
    }

    timeLeft(listing: Listing): number {
        if (!listing.active) {
            return 0
        }
        return this.timeLeftSeconds(listing)
    }
}

@Injectable()
export class WatchlistService {
    constructor(private prisma: PrismaService) { }

    async getAll(): Promise<Listing[]> {
        const listings: Listing[] = await this.prisma.listing.findMany({ orderBy: { createdAt: 'desc' } });
        return listings
    }

    async getByUserId(userId: Prisma.WatchlistWhereInput): Promise<Watchlist[]> {
        const watchlist: Watchlist[] = await this.prisma.watchlist.findMany({ where: userId, orderBy: { createdAt: 'desc' } });
        return watchlist
    }

    async getBySessionKey(sessionKey: UUID, userId: UUID): Promise<{ listingId: string; }[]> {
        const excludedListingIds = await this.prisma.watchlist.findMany({
            where: {
                user: {
                    id: userId, // Replace userId with your user's ID
                },
            },
            select: {
                listingId: true,
            },
        });
        const watchlist: { listingId: string; }[] = await this.prisma.watchlist.findMany({
            where: {
                sessionKey: sessionKey,
                listingId: {
                    notIn: excludedListingIds.map((item) => item.listingId),
                },
            },
            select: {
                listingId: true,
            },
        });
        return watchlist
    }

    async getByClientId(clientId: UUID): Promise<Watchlist[]> {
        const watchlist: Watchlist[] = await this.prisma.watchlist.findMany({
            where: {
                OR: [
                    { userId: clientId },
                    { sessionKey: clientId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        return watchlist
    }

    async getByClientIdAndListingId(listingId: string, clientId?: string): Promise<Watchlist | null> {
        if (!clientId) return null;

        const watchlist: Watchlist | null = await this.prisma.watchlist.findFirst({
            where: {
                listingId,
                OR: [
                    { userId: clientId },
                    { sessionKey: clientId }
                ]
            },
        });
        return watchlist
    }

    async create(data: Watchlist): Promise<Watchlist> {
        const userId: string | null = data.userId
        const sessionKey: string | null = data.sessionKey
        const listingId: string = data.listingId
        const clientId: string | null = userId || sessionKey

        // Avoid duplicates
        const existingWatchlist = await this.getByClientIdAndListingId(listingId, clientId as string)
        if (existingWatchlist) return existingWatchlist;
        return await this.prisma.watchlist.create({ data })
    }
}

@Injectable()
export class BidService {
    constructor(private prisma: PrismaService) { }

    async getByUserId(userId: Prisma.BidWhereInput): Promise<Bid[]> {
        const bids: Bid[] = await this.prisma.bid.findMany({ where: userId, orderBy: { createdAt: 'desc' } });
        return bids
    }

    async getByListingId(listingId: Prisma.BidWhereInput): Promise<Bid[]> {
        const bids: Bid[] = await this.prisma.bid.findMany({ where: listingId, orderBy: { createdAt: 'desc' } });
        return bids
    }


    async getByUserIdAndListingId(userId: string, listingId: string): Promise<Bid | null> {
        const bid: Bid | null = await this.prisma.bid.findFirst({
            where: {
                userId,
                listingId
            },
        });
        return bid
    }

    async create(data: Bid): Promise<Bid> {
        const userId: string | null = data.userId
        const listingId: string = data.listingId

        const existingBid: Bid | null = await this.getByUserIdAndListingId(userId, listingId)
        if (existingBid) {
            // Update the bid
            return await this.update(existingBid.id, data)
        }
        return await this.prisma.bid.create({ data })
    }

    async update(id: string, data: Bid): Promise<Bid> {
        return await this.prisma.bid.update({ where: { id }, data })
    }
}

