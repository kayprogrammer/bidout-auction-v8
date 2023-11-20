import { Module } from '@nestjs/common';
import { UserService, OtpService } from '../../prisma/services/accounts.service';
import { PrismaService } from '../../src/prisma.service';
import { AuthController } from '../controllers/auth.controller';
import { EmailSender } from '../utils/emails.service';

@Module({
  controllers: [AuthController],
  providers: [UserService, PrismaService, EmailSender, OtpService]
})
export class AuthModule { }