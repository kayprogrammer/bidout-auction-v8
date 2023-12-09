import { ResponseSchema, UserSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { listingExample } from "./schema_examples";
import { Expose, Transform, Type } from "class-transformer";

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
    @Transform(({ value, key, obj, type }) => obj.category?.name)
    category: string | null;

    @ApiProperty({ example: listingExample.price })
    @Expose()
    price: number;

    @ApiProperty({ example: listingExample.closingDate })
    @Expose()
    @Transform(({ value, key, obj, type }) => obj.closingDate.toISOString())
    closingDate: string;

    @ApiProperty({ example: listingExample.timeLeftSeconds })
    @Expose()
    timeLeftSeconds: number;

    @ApiProperty({ example: listingExample.active })
    @Expose()
    active: boolean;

    @ApiProperty({ example: listingExample.bidsCount })
    @Expose()
    bidsCount: number;

    @ApiProperty({ example: listingExample.highestBid })
    @Expose()
    highestBid: number;

    @ApiProperty({ example: listingExample.image })
    @Expose()
    image: string;

    @ApiProperty({ example: listingExample.watchlist })
    @Expose()
    watchlist: boolean;
}

export class ReviewSchema {
    @ApiProperty()
    @Type(() => UserSchema)
    @Expose()
    reviewer: UserSchema

    @ApiProperty({ example: "This is a nice platform" })
    @Expose()
    text: string

}

// RESPONSE SCHEMAS

export class ListingsResponseSchema extends ResponseSchema {
    @ApiProperty({ type: ListingSchema, isArray: true })
    data: ListingSchema[];
}