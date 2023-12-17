import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { Bid, Category, Listing, Prisma, User, Watchlist, FileModel } from '@prisma/client';
import { randomStr, slugify } from '../../src/utils/utils';
import { UUID } from 'crypto';
import { UserService } from './accounts.service';
import { FileService } from './general.service';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    async getAll(): Promise<{id: string}[]> {
        const categories: {id: string}[] = await this.prisma.category.findMany();
        return categories
    }

    async getByName(name: string): Promise<Category | null> {
        const user: Category | null = await this.prisma.category.findFirst({ where: {name} });
        return user
    }

    async getBySlug(slug: string): Promise<Category | null> {
        const user: Category | null = await this.prisma.category.findFirst({ where: {slug} });
        return user
    }

    async getAllIds(): Promise<string[]> {
        const categories: {id: string}[] = await this.getAll()
        return categories.map((category) => category.id)
    }

    async create(data: Record<string,any>): Promise<Category> {
        var slug: string = data.slug || slugify(data.name)
        var existingSlug = await this.getBySlug(slug)
        data.slug = slug
        if (existingSlug) {
            data.slug = `${slug}-${randomStr(4)}`
            return this.create(data)
        }
        const category: Category = await this.prisma.category.create({ data: data as any })
        return category
    }

    async bulkCreate(data: any): Promise<any> {
        await this.prisma.category.createMany({data, skipDuplicates: true})
    }

    async testCategory(): Promise<Category> {
        const name = "TestCategory"
        let category = await this.getByName(name) 
        if (!category) {
            category = await this.create({name: name})
        }
        return category
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
        if (!clientId) return [];

        const watchlist: Watchlist[] = await this.prisma.watchlist.findMany({
            where: {
                OR: [
                    { userId: clientId },
                    { sessionKey: clientId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {listing: { include: { category: true, auctioneer: true, image: true }}}
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
            include: {listing: { include: { category: true, auctioneer: true, image: true }}}
        });
        return watchlist
    }

    async create(data: Record<string,any>): Promise<Watchlist | null> {
        const userId: string | null = data.userId
        const sessionKey: string | null = data.sessionKey
        const listingId: string = data.listingId
        const clientId: string | null = userId || sessionKey

        // Delete if existing. Create if not.
        const existingWatchlist = await this.getByClientIdAndListingId(listingId, clientId as string)
        if (existingWatchlist) {
            await this.delete(existingWatchlist.id)
            return null
        } else {
            return await this.prisma.watchlist.create({ data: data as any })
        }
    }

    async delete(id: string) {
        await this.prisma.watchlist.delete({ where: { id } })
    }
}

@Injectable()
export class ListingService {
    constructor(
        private prisma: PrismaService,
        private watchlistService: WatchlistService,
        private userService: UserService,
        private categoryService: CategoryService,
        private fileService: FileService

    ) { }
    

    async getAll(quantity?: number, clientId?: string): Promise<Listing[]> {
        let listings: Listing[] = await this.prisma.listing.findMany({ orderBy: { createdAt: 'desc' }, include: {category: true, auctioneer: true, image: true}, ...(quantity && { take: quantity }), });
        if(clientId) {
            listings = await Promise.all(listings.map(async (listing: Listing) => {
                const watchlist = await this.watchlistService.getByClientIdAndListingId(listing.id, clientId);
                return { ...listing, watchlist: watchlist ? true : false };
            }));
        }
        return listings
    }

    async getByAuctioneerId(auctioneerId: Prisma.ListingWhereInput): Promise<Listing[]> {
        const listings: Listing[] = await this.prisma.listing.findMany({ where: auctioneerId, orderBy: { createdAt: 'desc' }, include: {category: true, auctioneer: true, image: true} });
        return listings
    }

    async getBySlug(slug: string): Promise<Listing | null> {
        const listing: Listing | null = await this.prisma.listing.findFirst({ where: {slug}, include: {category: true, auctioneer: true, image: true} });
        return listing
    }

    async getRelatedListings(categoryId: string, slug: string): Promise<Listing[]> {
        let listings: Listing[] = await this.prisma.listing.findMany(
            { where: { categoryId, NOT: { slug } }, include: {category: true, auctioneer: true, image: true} }
        );
        return listings
    }

    async getByCategory(categoryId: string | null, clientId?: string): Promise<Listing[]> {
        let listings: Listing[] = await this.prisma.listing.findMany(
            { where: {categoryId}, orderBy: { createdAt: 'desc' }, include: {category: true, auctioneer: true, image: true} }
        );
        if(clientId) {
            listings = await Promise.all(listings.map(async (listing: Listing) => {
                const watchlist = await this.watchlistService.getByClientIdAndListingId(listing.id, clientId);
                return { ...listing, watchlist: watchlist ? true : false };
            }));
        }
        return listings
    }

    async getCount(): Promise<number> {
        return this.prisma.listing.count()
    }

    async create(data: Record<string,any>): Promise<Listing> {
        var slug: string = data.slug || slugify(data.name)
        var existingSlug = await this.getBySlug(slug)
        data.slug = slug
        if (existingSlug) {
            data.slug = `${slug}-${randomStr(4)}`
            return this.create(data)
        }
        const listing: Listing = await this.prisma.listing.create({ data: data as any, include: {category: true, auctioneer: true, image: true} })
        return listing
    }

    async update(data: Record<string,any>): Promise<Listing> {
        if (data.name) {
            var slug: string = data.slug || slugify(data.name)
            var existingSlug: Listing | null = await this.prisma.listing.findFirst({ where: { slug, NOT: { id: data.id } } });
            data.slug = slug
            if (existingSlug) {
                data.slug = `${slug}-${randomStr(4)}`
                return this.update(data)
            }
        }
        const listing: Listing = await this.prisma.listing.update({ where: { id: data.id }, data, include: {category: true, auctioneer: true, image: true} })
        return listing
    }

    async bulkCreate(data: any): Promise<any> {
        await this.prisma.listing.createMany({data, skipDuplicates: true})
    }

    static timeLeftSeconds(listing: Listing): number {
        const currentDate: Date = new Date();
        const remainingTime: number = (listing.closingDate.valueOf() - currentDate.valueOf()) / 1000
        return remainingTime
    }

    static timeLeft(listing: Listing): number {
        if (!listing.active) {
            return 0
        }
        return this.timeLeftSeconds(listing)
    }

    static active(listing: Listing): boolean {
        const timeLeftSeconds = this.timeLeftSeconds(listing);
        return timeLeftSeconds > 0
    }

    // Test Data
    async testListing(): Promise<Record<string,any>> {
        const verifiedUser = await this.userService.testVerifiedUser()
        const file = await this.fileService.testFile()
        const category = await this.categoryService.testCategory()
        
        const listingDict = {
            auctioneerId: verifiedUser.id,
            name: "New Listing",
            desc: "New description",
            categoryId: category.id,
            price: 1000.00,
            closingDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
            imageId: file.id,
        }
        let listing = await this.prisma.listing.findFirst() 
        if (!listing) listing = await this.create(listingDict)
        return {user: verifiedUser, listing: listing, category: category}
    }
}

@Injectable()
export class BidService {
    constructor(
        private prisma: PrismaService,
        private listingsService: ListingService
    ) { }

    async getByUserId(userId: string): Promise<Bid[]> {
        const bids: Bid[] = await this.prisma.bid.findMany({ where: {userId}, orderBy: { createdAt: 'desc' } });
        return bids
    }

    async getByListingId(listingId: string, count?: number): Promise<Bid[]> {
        const bids: Bid[] = await this.prisma.bid.findMany({ where: {listingId}, orderBy: { createdAt: 'desc' }, include: {user: {include: {avatar: true}}}, ...(count && { take: count }) });
        return bids
    }


    async getByUserIdAndListingId(userId: string, listingId: string): Promise<Bid | null> {
        const bid: Bid | null = await this.prisma.bid.findFirst({
            where: {
                userId,
                listingId
            },
            include: {user: {include: {avatar: true}}}
        });
        return bid
    }

    async create(bidsCount: number, data: Record<string,any>): Promise<Bid> {
        const userId: string = data.userId
        const listingId: string = data.listingId

        let bid: Bid | null = await this.getByUserIdAndListingId(userId, listingId)
        if (bid) {
            // Update the bid
            bid = await this.update(bid.id, data)
        } else {
            bid = await this.prisma.bid.create({ data: data as any, include: {user: {include: {avatar: true}}} })
            bidsCount += 1
        }   
        // Update bids count and highest bids
        await this.listingsService.update({id: bid.listingId, highestBid: bid.amount, bidsCount: bidsCount})
        return bid
    }

    async update(id: string, data: Record<string, any>): Promise<Bid> {
        return await this.prisma.bid.update({ where: { id }, data, include: {user: {include: {avatar: true}}} })
    }
}

