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
    
    emailData(emailType: "activation" | "passwordReset" | "passwordResetSuccess" | "welcome"): Record<string, any> {
        const emailData = {
            activation: {subject: "Activate your account", template: "email-activation"},
            passwordReset: {subject: "Reset your password", template: "password-reset"},
            passwordResetSuccess: {subject: "Password reset successfully", template: "password-reset-success"},
            welcome: {subject: "Account verified", template: "Account verified"}
        }

        return emailData[emailType]
    }
    async sendEmail(user: User, emailType: "activation" | "passwordReset" | "passwordResetSuccess" | "welcome") {
        const emailData = this.emailData(emailType)
        let code: number | null = null
        if (emailData.template === "email-activation" || emailData.template === "password-reset") {
            // Generate OTP
            const otp = await this.otpService.create(user.id)
            code = otp.code
        }

        // Send email
        await this.mail.sendMail({
            to: user.email,
            from: settings.mailSenderEmail,
            subject: emailData.subject,
            template: emailData.template,
            context: {
                name: this.userService.fullName(user),
                otp: code
            }
        })
    }
}
