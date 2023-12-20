import { ApiProperty } from "@nestjs/swagger"
import { Prisma } from "@prisma/client"
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"
import { fileTypeExample, fileUploadDataExample, listingExample, userExample } from "./schema_examples"
import { ListingSchema } from "./listings"
import { ResponseSchema } from "./base"

export class CreateListingSchema {
    @IsString()
    @MaxLength(70)
    @ApiProperty({ example: listingExample.name })
    name: string

    @IsString()
    @ApiProperty({ example: listingExample.desc })
    desc: string

    @IsString()
    @ApiProperty({ example: listingExample.category.toLowerCase() })
    category: string

    @IsNumber({ maxDecimalPlaces: 2 })
    @ApiProperty({ example: listingExample.price })
    price: Prisma.Decimal

    @IsString()
    @ApiProperty({ name: "closing_date", example: listingExample.closingDate })
    closingDate: string

    @IsString()
    @ApiProperty({ name: "file_type", example: fileTypeExample })
    fileType: string
}

export class UpdateListingSchema {
    @IsOptional()
    @IsString()
    @MaxLength(70)
    @ApiProperty({ example: listingExample.name })
    name: string

    @IsOptional()
    @IsString()
    @ApiProperty({ example: listingExample.desc })
    desc: string

    @IsOptional()
    @IsString()
    @ApiProperty({ example: listingExample.category.toLowerCase() })
    category: string

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @ApiProperty({ example: listingExample.price })
    price: Prisma.Decimal

    @IsOptional()
    @IsString()
    @ApiProperty({ name: "closing_date", example: listingExample.closingDate })
    closingDate: string

    @IsOptional()
    @IsString()
    @ApiProperty({ name: "file_type", example: fileTypeExample })
    fileType: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ example: listingExample.active })
    active: boolean
}

export class CreateListingResponseDataSchema extends ListingSchema {
    @ApiProperty({ name: "file_upload_data", example: fileUploadDataExample })
    fileUploadData: Record<string,any>
}

export class CreateListingResponseSchema extends ResponseSchema {
    @ApiProperty({ type: CreateListingResponseDataSchema })
    data: CreateListingResponseDataSchema
}

// PROFILE SCHEMAS

export class ProfileDataSchema {
    @ApiProperty({ example: userExample.firstName })
    firstName: string

    @ApiProperty({ example: userExample.lastName })
    lastName: string

    @ApiProperty({ example: userExample.avatar })
    avatar: string
} 

export class UpdateProfileSchema {
    @IsString()
    @MaxLength(50)
    @ApiProperty({ example: userExample.firstName })
    firstName: string

    @IsString()
    @MaxLength(50)
    @ApiProperty({ example: userExample.lastName })
    lastName: string

    @IsString()
    @ApiProperty({ example: fileTypeExample })
    fileType: string
}

export class ProfileResponseSchema extends ResponseSchema {
    @ApiProperty({ type: ProfileDataSchema })
    data: ProfileDataSchema
}

export class UpdateProfileResponseDataSchema extends ProfileDataSchema {
    @ApiProperty({ name: "file_upload_data", example: fileUploadDataExample })
    fileUploadData: Record<string,any>
}

export class UpdateProfileResponseSchema extends ResponseSchema {
    @ApiProperty({ type: UpdateProfileResponseDataSchema })
    data: UpdateProfileResponseDataSchema
}

