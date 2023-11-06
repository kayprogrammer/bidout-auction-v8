import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Otp, Prisma, User } from '@prisma/client';
import { hashPassword } from 'src/utils';
import { randomInt } from 'crypto';
import settings from 'src/config/config';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async getByEmail(email: Prisma.UserWhereInput): Promise<User | null> {
        const user: User | null = await this.prisma.user.findFirst({ where: email });
        return user
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        data.password = await hashPassword(data.password)
        const user: User = await this.prisma.user.create({ data })
        return user
    }

    async update(data: User): Promise<User> {
        if (data.password) {
            data.password = await hashPassword(data.password)
        }
        const user: User = await this.prisma.user.update({ where: { id: data.id }, data })
        return user
    }

    fullName(user: User): string {
        return `${user.firstName} ${user.lastName}`
    }
}

@Injectable()
export class OtpService {
    constructor(private prisma: PrismaService) { }

    async getByUserId(id: Prisma.OtpWhereInput): Promise<Otp | null> {
        var otp: {} | null = await this.prisma.otp.findFirst({
            where: id, select: { code: true }
        });
        return otp as Otp
    }

    async create(data: Prisma.OtpCreateInput): Promise<Otp> {
        data.code = randomInt(100000, 999999)
        const existingOtp: Otp | null = await this.getByUserId(data.user as Prisma.OtpWhereInput)
        if (existingOtp) {
            return await this.update(data as unknown as Otp)
        }
        const otp: Otp = await this.prisma.otp.create({ data })
        return otp
    }

    async update(data: Otp): Promise<Otp> {
        const otp: Otp = await this.prisma.otp.update({ where: { userId: data.userId }, data })
        return otp
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

