import * as jwt from 'jsonwebtoken';
import settings from '../config/config';
import { randomStr } from './utils';
import { UserService } from '../../prisma/services/accounts.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

const verifyAsync = (token: string, secret: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, payload) => {
            if (err) {
                reject(err);
            } else {
                resolve(payload);
            }
        });
    });
}

const ALGORITHM = "HS256"

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
    ) { }

    createAccessToken(payload: Record<string, string|number>) {
        payload.exp = Math.floor(Date.now() / 1000) + (settings.accessTokenExpireMinutes * 60)
        return jwt.sign(payload, settings.secretKey, { algorithm: ALGORITHM });
    }

    createRefreshToken() {
        const payload: Record<string, string|number> = {data: randomStr(10)}
        payload.exp = Math.floor(Date.now() / 1000) + (settings.refreshTokenExpireMinutes * 60)
        return jwt.sign(payload, settings.secretKey, { algorithm: ALGORITHM });
    }

    async verifyRefreshToken(token: string) {
        try {
          const decoded = await verifyAsync(token, settings.secretKey) as any;
          return true
        } catch (error) {
            return false;
        }
    }

    async decodeJWT(token: string): Promise<User | null> {
        try {
          const decoded = await verifyAsync(token, settings.secretKey) as { userId?: string };;

          const userId = decoded?.userId;
      
          if (!userId) {
            return null;
          }
      
          const user = await this.userService.getById(userId);
      
          if (!user || user.access !== token) {
            return null;
          }
      
          return user;
        } catch (error) {
          return null;
        }
    }
}
