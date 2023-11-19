import { ResponseSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { userExample } from "./schema_examples";
import { IsEmail, IsNotEmpty } from "class-validator";
import { Expose } from "class-transformer";
import { SubscriberSchema } from "./general";

@Expose()
export class RegisterSchema {
    @ApiProperty({ example: userExample.firstName })
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: userExample.lastName })
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: userExample.email })
    @IsEmail({}, { message: "Enter a valid email" })
    email: string;

    @ApiProperty({ example: userExample.password })
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: true })
    @IsNotEmpty()
    termsAgreement: boolean;
}


export class RegisterResponseSchema extends ResponseSchema {
    @ApiProperty()
    data: SubscriberSchema;
}