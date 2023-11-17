import { ResponseSchema, UserSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { siteDetailExample, userExample } from "./schema_examples";
import { IsEmail } from "class-validator";
import { Expose, Type } from "class-transformer";

@Expose()
export class SiteDetailSchema {
    @ApiProperty({ example: siteDetailExample.name })
    name: string;

    @ApiProperty({ example: siteDetailExample.email })
    email: string;

    @ApiProperty({ example: siteDetailExample.phone })
    phone: string;

    @ApiProperty({ example: siteDetailExample.address })
    address: string;

    @ApiProperty({ example: siteDetailExample.fb })
    fb: string;

    @ApiProperty({ example: siteDetailExample.tw })
    tw: string;

    @ApiProperty({ example: siteDetailExample.wh })
    wh: string;

    @ApiProperty({ example: siteDetailExample.ig })
    ig: string;
}

@Expose()
export class SubscriberSchema {
    @IsEmail({}, { message: "Enter a valid email" })
    @ApiProperty({ example: userExample.email })
    email: string
}

@Expose()
export class ReviewSchema {
    @ApiProperty()
    @Type(() => UserSchema)
    reviewer: UserSchema

    @ApiProperty({ example: "This is a nice platform" })
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