import { ResponseSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { userExample } from "./schema_examples";
import { IsEmail, IsNotEmpty } from "class-validator";
import { SubscriberSchema } from "./general";

export class RegisterSchema {
    @ApiProperty({ name: "first_name", example: userExample.firstName })
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ name: "last_name", example: userExample.lastName })
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: userExample.email })
    @IsEmail({}, { message: "Enter a valid email" })
    email: string;

    @ApiProperty({ example: userExample.password })
    @IsNotEmpty()
    password: string;

    @ApiProperty({ name: "terms_agreement", example: true })
    @IsNotEmpty()
    termsAgreement: boolean;
}

export class RegisterResponseSchema extends ResponseSchema {
    @ApiProperty()
    data: SubscriberSchema;
}