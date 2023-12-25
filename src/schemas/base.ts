import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { userExample, uuidExample } from "./schema_examples";
import { FileProcessor } from "../utils/file_processors";
import { UserService } from "../../prisma/services/accounts.service";

export class ResponseSchema {
    @ApiProperty({ example: "success" })
    status: "success" | "failure" = "success";

    @ApiProperty()
    message: string;
}

@Exclude()
export class UserSchema {
    @ApiProperty({ example: uuidExample })
    @Expose()
    id: string

    @ApiProperty({ example: userExample.name })
    @Expose()
    @Transform(({ value, key, obj, type }) => UserService.fullName(obj))
    name: string

    @Expose()
    @ApiProperty({ example: userExample.avatar })
    @Transform(({ value, key, obj, type }) => FileProcessor.generateFileUrl(obj.avatar, "avatars"))
    avatar: string
}