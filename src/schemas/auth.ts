import { ResponseSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { userExample } from "./schema_examples";
import { IsEmail } from "class-validator";
import { Expose, Transform, Type, plainToInstance } from "class-transformer";
import { SubscriberSchema } from "./general";

@Expose()
export class RegisterSchema {
    @ApiProperty({ example: userExample.firstName })
    firstName: string;

    @ApiProperty({ example: userExample.lastName })
    lastName: string;

    @ApiProperty({ example: userExample.email })
    @IsEmail({}, { message: "Enter a valid email" })
    email: string;

    @ApiProperty({ example: userExample.password })
    password: string;

    @ApiProperty({ example: true })
    termsAgreement: boolean;
}


export class RegisterResponseSchema extends ResponseSchema {
    @ApiProperty()
    data: SubscriberSchema;
}