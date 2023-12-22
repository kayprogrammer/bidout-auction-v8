import { ApiProperty } from "@nestjs/swagger"
import { Prisma } from "@prisma/client"
import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator"
import { fileTypeExample, fileUploadDataExample, listingExample, userExample } from "./schema_examples"
import { ListingSchema } from "./listings"
import { ResponseSchema } from "./base"
import { ALLOWED_IMAGE_TYPES, FileProcessor } from "../utils/file_processors"
import { IsUtcDateTimeValid } from "./validators"
import { Expose, Transform } from "class-transformer"

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
    @IsIn(Object.keys(ALLOWED_IMAGE_TYPES))
    @ApiProperty({ name: "file_type", example: fileTypeExample })
    fileType: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ example: listingExample.active })
    active: boolean
}

export class CreateListingResponseDataSchema extends ListingSchema {
    @ApiProperty({ name: "file_upload_data", example: fileUploadDataExample })
    @Transform(({ value, key, obj, type }) => FileProcessor.generateFileSignature("listings", obj.imageId))
    @Expose()
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
    @Transform(({ value, key, obj, type }) => FileProcessor.generateFileSignature("avatars", obj.avatarId))
    @Expose()
    fileUploadData: Record<string,any>
}

export class UpdateProfileResponseSchema extends ResponseSchema {
    @ApiProperty({ type: UpdateProfileResponseDataSchema })
    data: UpdateProfileResponseDataSchema
}

