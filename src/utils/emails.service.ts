import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { OtpService, UserService } from '../../prisma/services/accounts.service';
import settings from '../config/config';

@Injectable()
export class EmailSender {
    constructor(
        private mail: MailerService, 
        private userService: UserService,
        private otpService: OtpService
    ) { }

    async sendActivationEmail(user: User) {
        // Generate OTP
        const otp = await this.otpService.create(user.id)

        // Send email
        await this.mail.sendMail({
            to: user.email,
            from: settings.mailSenderEmail,
            subject: "Activate your account",
            template: 'email-activation',
            context: {
                name: this.userService.fullName(user),
                otp: otp.code
            }
        })
    }
}
