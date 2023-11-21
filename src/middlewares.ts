// snake-case.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
const camelcaseObjectDeep = require("camelcase-object-deep");

@Injectable()
export class SnakeCaseMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = camelcaseObjectDeep(req.body, { deep: true });
    }
    next();
  }
}
