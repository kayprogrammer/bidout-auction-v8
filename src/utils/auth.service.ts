import * as jwt from 'jsonwebtoken';
import settings from '../config/config';
import { randomStr } from './utils';
import { UserService } from '../../prisma/services/accounts.service';
import { Injectable } from '@nestjs/common';

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

    verifyRefreshToken(token: string) {
        jwt.verify(token, settings.secretKey, (err) => {
            if (err) {
                return false
            } else {
                return true
            }
        });
    }

    async decodeJWT(token: string) {
        jwt.verify(token, settings.secretKey, async (err, decoded) => {
            if (err || !decoded) return null
            decoded = decoded as Record<string, any>
            const user = await this.userService.getById(decoded?.userId)
            if (!user || user.access !== token) return null
            return user
        });
    }
}
