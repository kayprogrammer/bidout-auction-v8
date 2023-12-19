import { UserService } from 'prisma/services/accounts.service';
import { AuthService } from '../utils/auth.service';
import supertest from 'supertest';

export const testGet = (api: supertest.SuperTest<supertest.Test>, endpoint: string) => api.get(`/api/v8${endpoint}`);
export const testPost = (api: supertest.SuperTest<supertest.Test>, endpoint: string) => api.post(`/api/v8${endpoint}`);
export const authTestGet = async (
    api: supertest.SuperTest<supertest.Test>, 
    endpoint: string,
    authService: AuthService, 
    userService: UserService, 
    user: Record<string,any>
): Promise<supertest.Test> => {
    const access = authService.createAccessToken({userId: user.id})
    const refresh = authService.createRefreshToken() 
    await userService.update({id: user.id, access: access, refresh: refresh})
    return api.get(`/api/v8${endpoint}`).set("authorization", `Bearer ${access}`)
};