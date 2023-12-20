import { ResponseSchema, UserSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { categoriesExample, listingExample, uuidExample } from "./schema_examples";
import { Expose, Transform, Type } from "class-transformer";
import { ListingService } from "../../prisma/services/listings.service";
import { FileProcessor } from "../utils/file_processors";
import { IsNumber, IsString } from "class-validator";
import { Prisma } from "@prisma/client";

export class ListingSchema {
    @ApiProperty({ example: listingExample.name })
    @Expose()
    name: string;

    @ApiProperty()
    @Type(() => UserSchema)
    @Expose()
    auctioneer: UserSchema;

    @ApiProperty({ example: listingExample.slug })
    @Expose()
    slug: string;

    @ApiProperty({ example: listingExample.desc })
    @Expose()
    desc: string;

    @ApiProperty({ example: listingExample.category })
    @Expose()
    @Transform(({ value, key, obj, type }) => obj.category?.name || null)
    category: string | null;

    @ApiProperty({ example: listingExample.price })
    @Expose()
    @Transform(({ value, key, obj, type }) => obj.price.toFixed(2))
    price: number;

    @ApiProperty({ example: listingExample.closingDate })
    @Expose()
    @Transform(({ value, key, obj, type }) => obj.closingDate.toISOString())
    closingDate: string;

    @ApiProperty({ example: listingExample.timeLeftSeconds })
    @Expose()
    @Transform(({ value, key, obj, type }) => ListingService.timeLeftSeconds(obj))
    timeLeftSeconds: number;

    @ApiProperty({ example: listingExample.active })
    @Expose()
    @Transform(({ value, key, obj, type }) => ListingService.active(obj))
    active: boolean;

    @ApiProperty({ example: listingExample.bidsCount })
    @Expose()
    bidsCount: number;

    @ApiProperty({ example: listingExample.highestBid })
    @Expose()
    @Transform(({ value, key, obj, type }) => obj.highestBid.toFixed(2))
    highestBid: number;

    @ApiProperty({ example: listingExample.image })
    @Expose()
    @Transform(({ value, key, obj, type }) => FileProcessor.generateFileUrl(obj.image, "listings"))
    image: string;

    @ApiProperty({ example: listingExample.watchlist })
    @Expose()
    @Transform(({ value, key, obj, type }) => obj?.watchlist || false)
    watchlist: boolean;
}

export class CategorySchema {
    @Expose()
    @ApiProperty({ example: categoriesExample.name })
    name: string

    @ApiProperty({ example: categoriesExample.slug })
    @Expose()
    slug: string
}
export class AddListingToWatchlistSchema {
    @IsString()
    @ApiProperty({ example: listingExample.slug })
    slug: string
}

export class BidSchema {
    @ApiProperty({ example: uuidExample })
    @Expose()
    id: string

    @ApiProperty()
    @Type(() => UserSchema)
    @Expose()
    user: UserSchema;

    @ApiProperty({ example: listingExample.price })
    @Transform(({ value, key, obj, type }) => parseFloat(obj.amount).toFixed(2))
    @Expose()
    amount: number

    @ApiProperty({ example: listingExample.closingDate })
    @Expose()
    @Transform(({ value, key, obj, type }) => obj.createdAt.toISOString())
    createdAt: string

    @ApiProperty({ example: listingExample.closingDate })
    @Expose()
    @Transform(({ value, key, obj, type }) => obj.updatedAt.toISOString())
    updatedAt: string
} 

export class CreateBidSchema {
    @IsNumber()
    @ApiProperty({ example: listingExample.price })
    amount: Prisma.Decimal
}

// RESPONSE SCHEMAS

export class ListingsResponseSchema extends ResponseSchema {
    @ApiProperty({ type: ListingSchema, isArray: true })
    data: ListingSchema[];
}

export class ListingResponseDetailDataSchema {
    @Expose()
    @ApiProperty({ type: ListingSchema })
    listing: ListingSchema;

    @Expose()
    @Type(() => ListingSchema)
    @ApiProperty({ type: ListingSchema, isArray: true })
    relatedListings: ListingSchema[];
}

export class ListingResponseSchema extends ResponseSchema {
    @ApiProperty()
    @Type(() => ListingResponseDetailDataSchema)
    data: ListingResponseDetailDataSchema;
}

export class CategoriesResponseSchema extends ResponseSchema {
    @ApiProperty({ type: CategorySchema, isArray: true })
    data: CategorySchema[];
}

export class AddListingToWatchlistResponseSchema extends ResponseSchema {
    @Expose()
    @ApiProperty({ example: {guestUserId: uuidExample} })
    data: Record<string,any>;
}

export class BidsResponseSchema extends ResponseSchema {
    @ApiProperty({ type: BidSchema, isArray: true })
    data: BidSchema[];
}

export class BidResponseSchema extends ResponseSchema {
    @ApiProperty({ type: BidSchema })
    data: BidSchema;
}