import { ResponseSchema } from "./base";
import { ApiProperty } from "@nestjs/swagger";
import { tokensExample, userExample } from "./schema_examples";
import { IsBoolean, IsEmail, IsNotEmpty, IsPositive, MaxLength, MinLength, ValidateIf, ValidationArguments } from "class-validator";
import { SubscriberSchema } from "./general";

export class RegisterSchema {
    @ApiProperty({ name: "first_name", example: userExample.firstName })
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @ApiProperty({ name: "last_name", example: userExample.lastName })
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @ApiProperty({ example: userExample.email })
    @IsEmail({}, { message: "Enter a valid email" })
    email: string;

    @ApiProperty({ example: userExample.password })
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({ name: "terms_agreement", example: true })
    @IsBoolean({})
    termsAgreement: boolean;
}

export class VerifyOtpSchema extends SubscriberSchema {
    @ApiProperty({ example: 123456 })
    @IsPositive()
    otp: number;
}

export class LoginSchema extends SubscriberSchema {
    @ApiProperty({ example: userExample.password })
    @IsNotEmpty()
    password: string;
}

export class SetNewPasswordSchema extends VerifyOtpSchema {
    @ApiProperty({ example: "newstrongpassword" })
    @MinLength(8)
    password: string;
}

export class RegisterResponseSchema extends ResponseSchema {
    @ApiProperty()
    data: SubscriberSchema;
}

export class TokensResponseSchema {
    @ApiProperty({ example: tokensExample.access })
    access: string;

    @ApiProperty({ example: tokensExample.access })
    refresh: string;
}

export class LoginResponseSchema extends ResponseSchema {
    @ApiProperty()
    data: TokensResponseSchema;
}