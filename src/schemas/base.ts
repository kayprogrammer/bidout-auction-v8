import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { userExample } from "./schema_examples";

export class ResponseSchema {
    @ApiProperty({example: "success"})
    status: "success" | "failure" = "success";

    @ApiProperty()
    message: string;
}

export class UserSchema {
    @Expose()
    @ApiProperty({ example: userExample.name })
    @Transform(({ value, key, obj, type }) => `${obj.firstName} ${obj.lastName}` )
    name: string

    @Expose()
    @ApiProperty({ example: userExample.avatar })
    avatar: string
}