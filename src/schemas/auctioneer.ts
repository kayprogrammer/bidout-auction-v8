import { ApiProperty } from "@nestjs/swagger"
import { Prisma } from "@prisma/client"
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator"
import { fileTypeExample, fileUploadDataExample, listingExample, userExample } from "./schema_examples"
import { ListingSchema } from "./listings"
import { ResponseSchema } from "./base"
import { ALLOWED_IMAGE_TYPES, FileProcessor } from "../utils/file_processors"
import { IsUtcDateTimeValid } from "./validators"
import { Exclude, Expose, Transform } from "class-transformer"

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
    @Min(0.01, {message: "Must not be less than 0.01"})
    @ApiProperty({ example: listingExample.price })
    price: Prisma.Decimal

    @IsUtcDateTimeValid()
    @IsNotEmpty()
    @ApiProperty({ name: "closing_date", example: listingExample.closingDate })
    closingDate: string

    @IsString()
    @IsIn(Object.keys(ALLOWED_IMAGE_TYPES), {message: "Invalid Image type"})
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
    @Min(0.01)
    @ApiProperty({ example: listingExample.price })
    price: Prisma.Decimal

    @IsOptional()
    @IsUtcDateTimeValid()
    @ApiProperty({ name: "closing_date", example: listingExample.closingDate })
    closingDate: string

    @IsOptional()
    @IsString()
    @IsIn(Object.keys(ALLOWED_IMAGE_TYPES), {message: "Invalid Image type"})
    @ApiProperty({ name: "file_type", example: fileTypeExample })
    fileType: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ example: listingExample.active })
    active: boolean
}

export class CreateListingResponseDataSchema extends ListingSchema {
    @Exclude()
    watchlist: boolean
    
    @Exclude()
    image: string

    @ApiProperty({ name: "file_upload_data", example: fileUploadDataExample })
    @Transform(({ value, key, obj, type }) => obj.fileUpload ? FileProcessor.generateFileSignature("listings", obj.imageId): null)
    @Expose()
    fileUploadData: Record<string,any>
}

export class CreateListingResponseSchema extends ResponseSchema {
    @ApiProperty({ type: CreateListingResponseDataSchema })
    data: CreateListingResponseDataSchema
}

// PROFILE SCHEMAS

export class ProfileDataSchema {
    @Expose()
    @ApiProperty({ example: userExample.firstName })
    firstName: string

    @Expose()
    @ApiProperty({ example: userExample.lastName })
    lastName: string

    @Expose()
    @ApiProperty({ example: userExample.avatar })
    @Transform(({ value, key, obj, type }) => FileProcessor.generateFileUrl(obj.avatar, "avatars"))
    avatar: string
} 

export class UpdateProfileSchema {
    @IsString()
    @MaxLength(50)
    @ApiProperty({ name: "first_name", example: userExample.firstName })
    firstName: string

    @IsString()
    @MaxLength(50)
    @ApiProperty({ name: "last_name", example: userExample.lastName })
    lastName: string

    @IsOptional()
    @IsString()
    @IsIn(Object.keys(ALLOWED_IMAGE_TYPES), {message: "Invalid Image type"})
    @ApiProperty({ name: "file_type", example: fileTypeExample })
    fileType: string
}

export class ProfileResponseSchema extends ResponseSchema {
    @ApiProperty({ type: ProfileDataSchema })
    data: ProfileDataSchema
}

export class UpdateProfileResponseDataSchema extends ProfileDataSchema {
    @Exclude()
    avatar: string

    @ApiProperty({ name: "file_upload_data", example: fileUploadDataExample })
    @Transform(({ value, key, obj, type }) => obj.fileUpload ? FileProcessor.generateFileSignature("avatars", obj.avatarId): null)
    @Expose()
    fileUploadData: Record<string,any>
}

export class UpdateProfileResponseSchema extends ResponseSchema {
    @ApiProperty({ type: UpdateProfileResponseDataSchema })
    data: UpdateProfileResponseDataSchema
}

