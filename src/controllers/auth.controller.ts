import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UserService, OtpService } from '../../prisma/services/accounts.service';
import { ReviewSchema, ReviewsResponseSchema, SiteDetailResponseSchema, SiteDetailSchema, SubscriberResponseSchema, SubscriberSchema } from '../schemas/general';
import { returnResponse } from '../utils/responses';
import { RegisterResponseSchema, RegisterSchema } from 'src/schemas/auth';

@Controller('api/v8/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) { }

  @Post("/register")
  @ApiOperation({ summary: 'Register a new user', description: "This endpoint registers new users into our application" })
  @ApiResponse({ status: 201, type: RegisterResponseSchema })
  async retrieveSiteDetails(@Body() data: RegisterSchema): Promise<RegisterResponseSchema> {
    // Check for existing user
    const existingUser = await this.userService.getByEmail(data.email)
    if (existingUser) {
        throw 
    }
    const user = await this.userService.create(data);

    // Return response
    return returnResponse(
        RegisterResponseSchema, 
      'Registration successful', 
      user, 
      SubscriberSchema
    )
  }
}
