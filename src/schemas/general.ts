import { ResponseSchema, UserSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { simpleUserExample, siteDetailExample, subscriberExample } from "./schema_examples";
import { Review, SiteDetail } from "@prisma/client";
import { IsEmail } from "class-validator";

export type SiteDetailSchema = Omit<SiteDetail, "id" | "createdAt" | "updatedAt">;

export class SubscriberSchema {
    @IsEmail({}, { message: "Enter a valid email" })
    @ApiProperty({ example: "johndoe@email.com" })
    email: string
}

export class ReviewSchema {
    @ApiProperty({ example: simpleUserExample })
    reviewer: UserSchema

    @ApiProperty({ example: "This is a nice platform" })
    text: string

}

// RESPONSE SCHEMAS
export class SiteDetailResponseSchema extends ResponseSchema {
    @ApiProperty({ example: siteDetailExample })
    data: SiteDetailSchema;
}

export class SubscriberResponseSchema extends ResponseSchema {
    @ApiProperty({ example: subscriberExample })
    data: SubscriberSchema;
}

export class ReviewsResponseSchema extends ResponseSchema {
    @ApiProperty()
    data: ReviewSchema[];
}