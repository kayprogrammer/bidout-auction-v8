import { ApiProperty } from "@nestjs/swagger";

export class ResponseSchema {
    @ApiProperty({example: "success"})
    status: "success" | "failure" = "success";

    @ApiProperty()
    message: string;
}