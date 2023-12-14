import { plainToInstance } from "class-transformer"
import snakecaseKeys from 'snakecase-keys'

export const Response = <T, U, V>(schema: new () => T, message: string, data?: U | U[], dataSchema?: new () => V | undefined): T => {
  let resp: any = new schema()
  resp.message = message
  if (dataSchema && data !== undefined) {
    resp.data = plainToInstance(dataSchema, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  } else {
    resp.data = data
  }
  // Convert to snake case
  resp = snakecaseKeys(resp)
  return resp
}