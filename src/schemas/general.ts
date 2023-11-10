import { ResponseSchema, UserSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { siteDetailExample, userExample } from "./schema_examples";
import { IsEmail } from "class-validator";
import { Expose, Type } from "class-transformer";

export class SiteDetailSchema {
    @Expose()
    @ApiProperty({ example: siteDetailExample.name })
    name: string;

    @ApiProperty({ example: siteDetailExample.email })
    @Expose()
    email: string;

    @ApiProperty({ example: siteDetailExample.phone })
    @Expose()
    phone: string;

    @ApiProperty({ example: siteDetailExample.address })
    @Expose()
    address: string;

    @ApiProperty({ example: siteDetailExample.fb })
    @Expose()
    fb: string;

    @ApiProperty({ example: siteDetailExample.tw })
    @Expose()
    tw: string;

    @ApiProperty({ example: siteDetailExample.wh })
    @Expose()
    wh: string;

    @ApiProperty({ example: siteDetailExample.ig })
    @Expose()
    ig: string;
}

export class SubscriberSchema {
    @Expose()
    @IsEmail({}, { message: "Enter a valid email" })
    @ApiProperty({ example: userExample.email })
    email: string
}

export class ReviewSchema {
    @ApiProperty()
    @Expose()
    @Type(() => UserSchema)
    reviewer: UserSchema

    @ApiProperty({ example: "This is a nice platform" })
    @Expose()
    text: string

}

// RESPONSE SCHEMAS
export class SiteDetailResponseSchema extends ResponseSchema {
    @ApiProperty()
    data: SiteDetailSchema;
}

export class SubscriberResponseSchema extends ResponseSchema {
    @ApiProperty()
    data: SubscriberSchema;
}

export class ReviewsResponseSchema extends ResponseSchema {
    @ApiProperty({ type: ReviewSchema, isArray: true })
    data: ReviewSchema[];
}