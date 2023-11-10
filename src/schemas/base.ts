import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { userExample } from "./schema_examples";
import { FileProcessor } from "../utils/file_processors";

const fileProcessor = new FileProcessor()

export class ResponseSchema {
    @ApiProperty({ example: "success" })
    status: "success" | "failure" = "success";

    @ApiProperty()
    message: string;
}

@Exclude()
export class UserSchema {
    @ApiProperty({ example: userExample.name })
    @Expose()
    @Transform(({ value, key, obj, type }) => `${obj.firstName} ${obj.lastName}`)
    name: string

    @Expose()
    @ApiProperty({ example: userExample.avatar })
    
    @Transform(({ value, key, obj, type }) => fileProcessor.generateFileUrl(obj.avatar, "avatars"))
    avatar: string
}