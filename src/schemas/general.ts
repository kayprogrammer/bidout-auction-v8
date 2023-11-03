import { SiteDetail } from "@prisma/client";
import { ResponseSchema } from "./base";

export type SiteDetailSchema = Omit<SiteDetail, "id" | "createdAt" | "updatedAt">;

export class SiteDetailResponseSchema extends ResponseSchema {
    data: SiteDetailSchema;
}