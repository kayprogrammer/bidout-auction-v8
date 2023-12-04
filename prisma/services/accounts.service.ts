import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { GuestUser, Otp, Prisma, User } from '@prisma/client';
import { hashPassword } from '../../src/utils/utils';
import { randomInt } from 'crypto';
import settings from '../../src/config/config'; 

const userData: Prisma.UserCreateInput = {
    firstName: "Test",
    lastName: "User",
    email: "testuser@email.com",
    password: "testpassword",
} 

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async getById(id: string): Promise<User | null> {
        const user: User | null = await this.prisma.user.findFirst({ where: {id} });
        return user
    }

    async getByEmail(email: string): Promise<User | null> {
        const user: User | null = await this.prisma.user.findFirst({ where: {email} });
        return user
    }

    async getByRefreshToken(refresh: string): Promise<User | null> {
        const user: User | null = await this.prisma.user.findFirst({ where: {refresh} });
        return user
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        data.password = await hashPassword(data.password)
        const user: User = await this.prisma.user.create({ data })
        return user
    }

    async update(data: Record<string,any>): Promise<User> {
        if (data.password) {
            data.password = await hashPassword(data.password)
        }
        const user: User = await this.prisma.user.update({ where: { id: data.id }, data })
        return user
    }

    fullName(user: User): string {
        return `${user.firstName} ${user.lastName}`
    }

    async getGuestUserById(id: string): Promise<GuestUser | null> {
        const guestUser: GuestUser | null = await this.prisma.guestUser.findFirst({ where: {id}})
        return guestUser
    }
    // -------------------
    // Test data
    // -------------------

    // User
    async testUser(): Promise<User> {
        return await this.create(userData)
    }

    // Verified user
    async testVerifiedUser(): Promise<User> {
        userData.lastName = "VerifiedUser"
        userData.email = "testverifieduser@email.com"
        userData.isEmailVerified = true
        return await this.create(userData)
    }

    // Another Verified user
    async testAnotherVerifiedUser(): Promise<User> {
        userData.lastName = "AnotherVerifiedUser"
        userData.email = "anothertestverifieduser@email.com"
        userData.isEmailVerified = true
        return await this.create(userData)
    }
}

@Injectable()
export class OtpService {
    constructor(private prisma: PrismaService) { }

    async getByUserId(id: string): Promise<Otp | null> {
        var otp: {} | null = await this.prisma.otp.findFirst({
            where: {userId: id}, select: { id: true, code: true, updatedAt: true }
        });
        return otp as Otp
    }

    async create(userId: string): Promise<Otp> {
        const data = {code: randomInt(100000, 999999), userId}
        const existingOtp: Otp | null = await this.getByUserId(userId)
        if (existingOtp) {
            return await this.update(data)
        }
        return await this.prisma.otp.create({data: data as any})
    }

    async update(data: Record<string, any>): Promise<Otp> {
        const otp: Otp = await this.prisma.otp.update({ where: { userId: data.userId }, data })
        return otp
    }

    async delete(id: string) {
        await this.prisma.otp.delete({ where: { id } })
    }

    checkOtpExpiration(otp: Otp): boolean {
        const currentDate: Date = new Date();
        const timeDifference: number = (currentDate.valueOf() - otp.updatedAt.valueOf()) / 1000
        if (timeDifference > settings.emailOTPExpireSeconds) {
            return true
        }
        return false
    }
}

