import { ResponseSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { siteDetailExample, subscriberExample } from "./schema_examples";
import { SiteDetail } from "@prisma/client";
import { IsEmail } from "class-validator";

export type SiteDetailSchema = Omit<SiteDetail, "id" | "createdAt" | "updatedAt">;

export class SubscriberSchema {
    @IsEmail()
    @ApiProperty({example: "johndoe@email.com"})
    email: string
}

export class SiteDetailResponseSchema extends ResponseSchema {
    @ApiProperty({example: siteDetailExample})
    data: SiteDetailSchema;
}

export class SubscriberResponseSchema extends ResponseSchema {
    @ApiProperty({example: subscriberExample})
    data: SubscriberSchema;
}