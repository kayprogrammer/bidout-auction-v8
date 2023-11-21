import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UserService } from '../../prisma/services/accounts.service';
import { SubscriberSchema } from '../schemas/general';
import { returnResponse } from '../utils/responses';
import { RegisterResponseSchema, RegisterSchema } from 'src/schemas/auth';
import { RequestError } from '../exceptions.filter';
import { EmailSender } from 'src/utils/emails.service';

@Controller('api/v8/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly emailSender: EmailSender,
  ) { }

  @Post("/register")
  @ApiOperation({ summary: 'Register a new user', description: "This endpoint registers new users into our application" })
  @ApiResponse({ status: 201, type: RegisterResponseSchema })
  async retrieveSiteDetails(@Body() data: RegisterSchema): Promise<RegisterResponseSchema> {
    // Check for existing user
    const existingUser = await this.userService.getByEmail(data.email)
    if (existingUser) {
      throw new RequestError('Invalid Entry', 422, { email: 'Email already registered' });
    }
    const user = await this.userService.create(data);

    // Send email
    await this.emailSender.sendEmail(user, "activation")

    // Return response
    return returnResponse(
      RegisterResponseSchema, 
      'Registration successful', 
      user, 
      SubscriberSchema
    )
  }
}
