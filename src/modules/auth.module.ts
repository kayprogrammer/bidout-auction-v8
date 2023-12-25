import { Module } from '@nestjs/common';
import { UserService, OtpService } from '../../prisma/services/accounts.service';
import { PrismaService } from '../../src/prisma.service';
import { AuthController } from '../controllers/auth.controller';
import { EmailSender } from '../utils/emails.service';
import { BullModule } from '@nestjs/bull';
import { AuthService } from '../utils/auth.service';
import { WatchlistService } from '../../prisma/services/listings.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [AuthController],
  providers: [UserService, EmailSender, OtpService, AuthService, WatchlistService, PrismaService]
})
export class AuthModule { }