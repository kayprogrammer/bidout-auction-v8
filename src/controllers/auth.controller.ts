import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { OtpService, UserService } from '../../prisma/services/accounts.service';
import { SubscriberSchema } from '../schemas/general';
import { Response } from '../utils/responses';
import { RegisterResponseSchema, RegisterSchema, VerifyOtpSchema } from '../schemas/auth';
import { RequestError } from '../exceptions.filter';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ResponseSchema } from '../schemas/base';

@Controller('api/v8/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    @InjectQueue('email') private readonly emailSender: Queue
  ) { }

  @Post("/register")
  @ApiOperation({ summary: "Register a new user", description: "This endpoint registers new users into our application" })
  @ApiResponse({ status: 201, type: RegisterResponseSchema })
  async register(@Body() data: RegisterSchema): Promise<RegisterResponseSchema> {
    // Check for existing user
    const existingUser = await this.userService.getByEmail(data.email)
    if (existingUser) {
      throw new RequestError('Invalid Entry', 422, { email: 'Email already registered' });
    }
    const user = await this.userService.create(data as any);

    // Send email
    await this.emailSender.add({user: user, emailType: "activation"})

    // Return response
    return Response(
      RegisterResponseSchema, 
      'Registration successful', 
      user, 
      SubscriberSchema
    )
  }

  @Post("/verify-email")
  @ApiOperation({ summary: "Verify a user's email", description: "This endpoint verifies a user's email" })
  @ApiResponse({ status: 200, type: ResponseSchema })
  async verify_email(@Body() data: VerifyOtpSchema): Promise<ResponseSchema> {
    // Validate user
    const userByEmail = await this.userService.getByEmail(data.email)
    if (!userByEmail) {
      throw new RequestError('Incorrect Email', 404);
    }

    if(userByEmail.isEmailVerified) {
      return Response(
        ResponseSchema,
        "Email already verified",
      )
    }

    // Validate otp
    const otp = await this.otpService.getByUserId(userByEmail.id)
    if (!otp || otp.code !== data.otp) {
      throw new RequestError("Incorrect Otp")
    }
    if (this.otpService.checkOtpExpiration(otp)) {
      throw new RequestError("Expired Otp")
    }
    userByEmail.isEmailVerified = true
    await this.userService.update(userByEmail)
    await this.otpService.delete(otp.id)

    // Send welcome email
    await this.emailSender.add({user: userByEmail, emailType: "welcome"})

    // Return response
    return Response(
      ResponseSchema, 
      'Account verification successful', 
    )
  }

  @Post("/resend-verification-email")
  @ApiOperation({ summary: "Resend Verification Email", description: "This endpoint resends new otp to the user's email" })
  @ApiResponse({ status: 200, type: ResponseSchema })
  async resend_verification_email(@Body() data: SubscriberSchema): Promise<ResponseSchema> {
    // Validate user
    const userByEmail = await this.userService.getByEmail(data.email)
    if (!userByEmail) {
      throw new RequestError('Incorrect Email', 404);
    }

    if(userByEmail.isEmailVerified) {
      return Response(
        ResponseSchema,
        "Email already verified",
      )
    }

    // Send verification email
    await this.emailSender.add({user: userByEmail, emailType: "activation"})
    
    // Return response
    return Response(
      ResponseSchema, 
      'Verification email sent',
    )
  }
}
