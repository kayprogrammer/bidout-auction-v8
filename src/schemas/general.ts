import { SiteDetail } from "@prisma/client";
import { ResponseSchema } from "./base";

export class SiteDetailResponseSchema extends ResponseSchema {
    data: SiteDetail;
}