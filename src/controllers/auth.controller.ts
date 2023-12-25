import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { OtpService, UserService } from '../../prisma/services/accounts.service';
import { SubscriberSchema } from '../schemas/general';
import { Response } from '../utils/responses';
import { LoginResponseSchema, LoginSchema, RegisterResponseSchema, RegisterSchema, SetNewPasswordSchema, TokenRefreshSchema, TokensResponseSchema, VerifyOtpSchema } from '../schemas/auth';
import { RequestError } from '../exceptions.filter';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ResponseSchema } from '../schemas/base';
import { checkPassword } from '../utils/utils';
import { AuthService } from '../utils/auth.service';
import { AuthGuard, ClientGuard } from './deps';
import { WatchlistService } from '../../prisma/services/listings.service';
import { Watchlist } from '@prisma/client';

@Controller('api/v8/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
    private readonly watchlistService: WatchlistService,

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
  @HttpCode(200)
  async verifyEmail(@Body() data: VerifyOtpSchema): Promise<ResponseSchema> {
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
  @HttpCode(200)
  async resendVerificationEmail(@Body() data: SubscriberSchema): Promise<ResponseSchema> {
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

  @Post("/send-password-reset-otp")
  @ApiOperation({ summary: "Send Password Reset Otp", description: "This endpoint sends new password reset otp to the user's email" })
  @ApiResponse({ status: 200, type: ResponseSchema })
  @HttpCode(200)
  async sendPasswordResetOtp(@Body() data: SubscriberSchema): Promise<ResponseSchema> {
    // Validate user
    const userByEmail = await this.userService.getByEmail(data.email)
    if (!userByEmail) {
      throw new RequestError('Incorrect Email', 404);
    }

    // Send password reset email
    await this.emailSender.add({user: userByEmail, emailType: "passwordReset"})
    
    // Return response
    return Response(
      ResponseSchema, 
      'Password otp sent',
    )
  }

  @Post("/set-new-password")
  @ApiOperation({ summary: "Set New Password", description: "This endpoint verifies the password reset otp" })
  @ApiResponse({ status: 200, type: ResponseSchema })
  @HttpCode(200)
  async setNewPassword(@Body() data: SetNewPasswordSchema): Promise<ResponseSchema> {
    // Validate user
    const userByEmail = await this.userService.getByEmail(data.email)
    if (!userByEmail) {
      throw new RequestError('Incorrect Email', 404);
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

    // Update user
    await this.userService.update({id: userByEmail.id, password: data.password})

    // Send verification email
    await this.emailSender.add({user: userByEmail, emailType: "passwordResetSuccess"})
    
    // Return response
    return Response(
      ResponseSchema, 
      'Password reset successful',
    )
  }

  @Post("/login")
  @ApiOperation({ summary: "Login User", description: "This endpoint generates new access and refresh tokens for authentication" })
  @ApiResponse({ status: 201, type: LoginResponseSchema })
  @ApiSecurity("GuestUserId")
  @UseGuards(ClientGuard)
  async login(@Req() req: any, @Body() data: LoginSchema): Promise<LoginResponseSchema> {
    const client = req.client
    const clientId = client.id

    // Validate credentials
    let user = await this.userService.getByEmail(data.email)
    if (!user || !(await checkPassword(data.password, user.password))) throw new RequestError('Invalid credentials', 401);

    if (!user.isEmailVerified) throw new RequestError('Verify your email first', 401);

    // Create Jwt tokens
    const access = this.authService.createAccessToken({userId: user.id})
    const refresh = this.authService.createRefreshToken() 
    user = await this.userService.update({id: user.id, access: access, refresh: refresh})

    // Move all guest user watchlists to the authenticated user watchlists
    const guestUserWatchlists = await this.watchlistService.getBySessionKey(
      clientId ? clientId : null, user.id
    )
    if(guestUserWatchlists.length > 0){
        const dataToCreate = guestUserWatchlists.map((watchlist: Watchlist) => {
          return {"userId": user?.id, "listingId": watchlist.listingId}
        })
        await this.watchlistService.bulkCreate(dataToCreate)
      }
      
    if (!client.isAuthenticated && clientId) await this.userService.deleteGuest(client.id) // Delete client (Almost like clearing sessions)

    // Return response
    return Response(
      LoginResponseSchema, 
      'Login successful',
      user,
      TokensResponseSchema
    )
  }

  @Post("/refresh")
  @ApiOperation({ summary: "Refresh Tokens", description: "This endpoint refreshes user access and refresh tokens" })
  @ApiResponse({ status: 201, type: LoginResponseSchema })
  async refresh(@Body() data: TokenRefreshSchema): Promise<LoginResponseSchema> {
    // Validate token
    let refresh = data.refresh
    let user = await this.userService.getByRefreshToken(refresh)
    if (!user || !(await this.authService.verifyRefreshToken(refresh))) {
      throw new RequestError('Refresh token is invalid or expired', 401);
    }

    // Create New Jwt tokens
    const access = this.authService.createAccessToken({userId: user.id})
    refresh = this.authService.createRefreshToken() 
    user = await this.userService.update({id: user.id, access: access, refresh: refresh})

    // Return response
    return Response(
      LoginResponseSchema, 
      'Tokens refresh successful',
      user,
      TokensResponseSchema
    )
  }

  @Get("/logout")
  @ApiOperation({ summary: "Logout User", description: "This endpoint logs out a user" })
  @ApiResponse({ status: 200, type: ResponseSchema })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logout(@Req() req: any): Promise<ResponseSchema> {
    await this.userService.update({id: req.user.id, access: null, refresh: null})
    // Return response
    return Response(
      ResponseSchema, 
      'Logout successful',
    )
  }
}
