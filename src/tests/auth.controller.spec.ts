import { UserService, OtpService } from '../../prisma/services/accounts.service';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { AuthService } from '../utils/auth.service';
import supertest from 'supertest';
import { AuthModule } from '../modules/auth.module';
import { testGet, testPost } from './utils';
import { setupServer, teardownServer } from './test-setup';

describe('AuthController', () => {
  let api: supertest.SuperTest<supertest.Test>;
  let userService: UserService;
  let otpService: OtpService;
  let emailSender: any
  let authService: AuthService

  beforeAll(async () => {
    const app = await setupServer(AuthModule);
    api = supertest(await app.getHttpServer());
    const prisma = new PrismaService();
    userService = new UserService(prisma);
    otpService = new OtpService(prisma);
    authService = new AuthService(userService);
    emailSender = { add: jest.fn() }
  });

  it('Should successfully register a user', async () => {
    const registerData = {firstName: "John", lastName: "Doe", email: "johndoe@email.com", password: "testpass", termsAgreement: true}
    emailSender.add.mockResolvedValueOnce(0);
    let result = testPost(api, '/auth/register').send(registerData);

    await result.expect(201);
    await result.expect((response) => {
        const respBody = response.body
        expect(respBody).toHaveProperty('status', 'success');
        expect(respBody).toHaveProperty('message', 'Registration successful');
        expect(respBody.data).toHaveProperty("data", {email: registerData.email});
    });
    
    // Confirm an error is raised if the email has been used
    result = testPost(api, '/auth/register').send(registerData);
    await result.expect(422)
    await result.expect((response) => {
        const respBody = response.body
        expect(respBody).toHaveProperty('status', 'failure');
        expect(respBody).toHaveProperty('message', 'Invalid Entry');
        expect(respBody.data).toHaveProperty("data", {email: 'Email already registered'});
    })
  });
  
  it("Should successfully verify a user's email", async () => {
    const verificationData = {email: "incorrect@email.com", otp: 123456}
    emailSender.add.mockResolvedValueOnce(0);

    // Confirm an error is raised if the email is incorrect
    let result = testPost(api, '/auth/verify-email').send(verificationData);
    await result.expect(404)

    await result.expect((response) => {
        const respBody = response.body
        expect(respBody).toHaveProperty('status', 'failure');
        expect(respBody).toHaveProperty('message', 'Incorrect Email');
    })

    // Create otp
    verificationData.email = "johndoe@email.com"
    const user = await userService.getByEmail(verificationData.email) as User
    const otp = await otpService.create(user.id) // Create otp

    // Confirm an error is raised if the otp is incorrect
    result = testPost(api, '/auth/verify-email').send(verificationData);
    await result.expect(400)

    await result.expect((response) => {
        const respBody = response.body
        expect(respBody).toHaveProperty('status', 'failure');
        expect(respBody).toHaveProperty('message', 'Incorrect Otp');
    })

    // Confirm if the email was verified successfully
    verificationData.otp = otp.code
    result = testPost(api, '/auth/verify-email').send(verificationData);
    await result.expect(200)

    await result.expect((response) => {
        const respBody = response.body
        expect(respBody).toHaveProperty('status', 'success');
        expect(respBody).toHaveProperty('message', 'Account verification successful');
    })
  });

  it("Should successfully resend a verification email", async () => {
    const emailData = {email: "incorrect@email.com"}
    emailSender.add.mockResolvedValueOnce(0);

    // Confirm an error is raised if the email is incorrect
    let result = testPost(api, '/auth/resend-verification-email').send(emailData);
    await result.expect(404)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'failure');
      expect(respBody).toHaveProperty('message', 'Incorrect Email');
    })

    // Confirm if the email was already verfied (previous test already made sure it was)
    emailData.email = "johndoe@email.com"
    result = testPost(api, '/auth/resend-verification-email').send(emailData);
    await result.expect(200)
    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Email already verified');
    })

    // Confirm if the email was sent successfully
    const user = await userService.getByEmail(emailData.email) as User
    await userService.update({id: user.id, isEmailVerified: false}) // Set verfication to false     
    result = testPost(api, '/auth/resend-verification-email').send(emailData);
    await result.expect(200)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Verification email sent');
    })
  });

  it("Should successfully send password reset otp email", async () => {
    const emailData = {email: "incorrect@email.com"}
    emailSender.add.mockResolvedValueOnce(0);

    // Confirm an error is raised if the email is incorrect
    let result = testPost(api, '/auth/send-password-reset-otp').send(emailData);
    await result.expect(404)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'failure');
      expect(respBody).toHaveProperty('message', 'Incorrect Email');
    })


    // Confirm if the email was sent successfully
    emailData.email = "johndoe@email.com"
    result = testPost(api, '/auth/send-password-reset-otp').send(emailData);
    await result.expect(200)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Password otp sent');
    })
  });

  it("Should successfully set a new password successfully", async () => {
    const passwordResetData = {email: "incorrect@email.com", otp: 123456, password: "newtestpassword"}
    emailSender.add.mockResolvedValueOnce(0);

    // Confirm an error is raised if the email is incorrect
    let result = testPost(api, '/auth/set-new-password').send(passwordResetData);
    await result.expect(404)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'failure');
      expect(respBody).toHaveProperty('message', 'Incorrect Email');
    })

    // Create otp
    passwordResetData.email = "johndoe@email.com"
    const user = await userService.getByEmail(passwordResetData.email) as User
    const otp = await otpService.create(user.id) // Create otp

    // Confirm an error is raised if the otp is incorrect
    result = testPost(api, '/auth/set-new-password').send(passwordResetData);
    await result.expect(400)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'failure');
      expect(respBody).toHaveProperty('message', 'Incorrect Otp');
    })

    // Confirm if the password was changed successfully
    passwordResetData.otp = otp.code
    result = testPost(api, '/auth/set-new-password').send(passwordResetData);
    await result.expect(200)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Password reset successful');
    })
  });

  it("Should successfully generate access and refresh tokens for user", async () => {
    const loginData = {email: "incorrect@email.com", password: "incorrect"}

    // Confirm an error is raised if the credentials are incorrect
    let result = testPost(api, '/auth/login').send(loginData);
    await result.expect(401)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'failure');
      expect(respBody).toHaveProperty('message', 'Invalid credentials');
    })
    
    const user = await userService.testUser()
    loginData.email = user.email
    loginData.password = "testpassword"

    // Confirm an error is raised if the user is unverified
    result = testPost(api, '/auth/login').send(loginData);
    await result.expect(401)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'failure');
      expect(respBody).toHaveProperty('message', 'Verify your email first');
    })
    
    await userService.update({id: user.id, isEmailVerified: true})

    // Confirm if the email was sent successfully
    result = testPost(api, '/auth/login').send(loginData);
    await result.expect(201)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Login successful');
      expect(respBody).toHaveProperty('data', {access: expect.any(String), refresh: expect.any(String)});
    })
  });

  it("Should successfully refresh user tokens", async () => {
    const refreshData = {refresh: "invalid-token"}

    // Confirm an error is raised if the token is invalid
    let result = testPost(api, '/auth/refresh').send(refreshData);
    await result.expect(401)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'failure');
      expect(respBody).toHaveProperty('message', 'Refresh token is invalid or expired');
    })
    
    const user = await userService.testVerifiedUser()
    
    const access = authService.createAccessToken({userId: user.id})
    const refresh = authService.createRefreshToken() 
    await userService.update({id: user.id, access: access, refresh: refresh})

    // Confirm if the email was sent successfully
    refreshData.refresh = refresh
    result = testPost(api, '/auth/refresh').send(refreshData);
    await result.expect(201)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Tokens refresh successful');
      expect(result).toHaveProperty('data', {access: expect.any(String), refresh: expect.any(String)});
    })
  });

  it("Should successfully logout user", async () => {
    // Confirm an error is raised if the token is invalid
    let result = testGet(api, '/auth/logout').set("authorization", "Bearer invalid_token");
    await result.expect(401)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'failure');
      expect(respBody).toHaveProperty('message', 'Auth token is invalid or expired');
    })
    
    const user = await userService.testVerifiedUser()
    
    const access = authService.createAccessToken({userId: user.id})
    const refresh = authService.createRefreshToken() 
    await userService.update({id: user.id, access: access, refresh: refresh})


    // Confirm if the email was sent successfully
    result = testGet(api, '/auth/logout').set("authorization", `Bearer ${access}`);
    await result.expect(200)

    await result.expect((response) => {
      const respBody = response.body
      expect(respBody).toHaveProperty('status', 'success');
      expect(respBody).toHaveProperty('message', 'Logout successful');
    })
  });

  afterAll(async () => {
    await teardownServer();
  });
});