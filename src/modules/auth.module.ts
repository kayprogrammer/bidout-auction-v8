import { Module } from '@nestjs/common';
import { UserService, OtpService } from '../../prisma/services/accounts.service';
import { PrismaService } from '../../src/prisma.service';
import { AuthController } from 'src/controllers/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [UserService, OtpService, PrismaService]
})
export class AuthModule { }