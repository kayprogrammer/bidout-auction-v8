import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../utils/auth.service';
import { RequestError } from '../exceptions.filter';
import { UserService } from '../../prisma/services/accounts.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new RequestError("Unauthorized User", 401)
        }
    
        const decoded = await this.authService.decodeJWT(token);
        if (!decoded) {
            throw new RequestError("Auth Token is invalid or expired", 401)
        }
        request.user = decoded; // Attach user to the request
        return true
    }
}

@Injectable()
export class ClientGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private userService: UserService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const guestuserid = request.headers["guestuserid"];
        const token = request.headers.authorization?.split(' ')[1];
        request.client = {id: null, isAuthenticated: false}

        if (token) {
            const decoded = await this.authService.decodeJWT(token);
            if (!decoded) {
                throw new RequestError("Auth Token is invalid or expired", 401)
            }
            request.client = decoded; // Attach user to the request
            request.client.isAuthenticated = true
        } else if (guestuserid) {
            const guestuser = await this.userService.getGuestUserById(guestuserid)
            request.client = guestuser
        }
        return true
    }
}