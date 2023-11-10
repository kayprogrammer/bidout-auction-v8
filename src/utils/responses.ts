import { plainToInstance } from "class-transformer"

export const returnResponse = <T, U, V>(schema: new () => T, message: string, data?: U | U[], dataSchema?: new () => V | undefined): T => {
    const resp: any = new schema()
    resp.message = message
    if (dataSchema && data !== undefined) {
        resp.data = plainToInstance(dataSchema, data, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        });
    }
    return resp
}