import { AuthController } from '../controllers/auth.controller';
import { UserService, OtpService } from '../../prisma/services/accounts.service';
import { PrismaService } from '../prisma.service';
import { RequestError } from '../exceptions.filter';
import { User } from '@prisma/client';
import { AuthService } from '../utils/auth.service';
import { Request } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UserService;
  let otpService: OtpService;
  let emailSender: any
  let authService: AuthService

  beforeEach(() => {
    userService = new UserService(new PrismaService());
    otpService = new OtpService(new PrismaService());
    authService = new AuthService(userService);
    emailSender = { add: jest.fn() }
    authController = new AuthController(userService, otpService, authService, emailSender);
  });

  describe('register', () => {
    it('Should successfully register a user', async () => {
      const registerData = {firstName: "John", lastName: "Doe", email: "johndoe@email.com", password: "testpass", termsAgreement: true}
      emailSender.add.mockResolvedValueOnce(0);
      let result = await authController.register(registerData);

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Registration successful');
      expect(result).toHaveProperty('data', {email: registerData.email});

      // Confirm an error is raised if the email has been used
      expect(async () => {
        await authController.register(registerData);
      }).rejects.toThrow(RequestError);
    });
  });
  describe('verifyEmail', () => {
    it("Should successfully verify a user's email", async () => {
      const verificationData = {email: "incorrect@email.com", otp: 123456}
      emailSender.add.mockResolvedValueOnce(0);

      // Confirm an error is raised if the email is incorrect
      await expect(authController.verifyEmail(verificationData)).rejects.toMatchObject({
        status: 404,
        message: "Incorrect Email"
      });

      // Create otp
      verificationData.email = "johndoe@email.com"
      const user = await userService.getByEmail(verificationData.email) as User
      const otp = await otpService.create(user.id) // Create otp

      // Confirm an error is raised if the otp is incorrect
      await expect(authController.verifyEmail(verificationData)).rejects.toMatchObject({
        status: 400,
        message: "Incorrect Otp"
      });

      // Confirm if the email was verified successfully
      verificationData.otp = otp.code
      const result = await authController.verifyEmail(verificationData);
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Account verification successful');
    });
  });

  describe('resendVerificationEmail', () => {
    it("Should successfully resend a verification email", async () => {
      const emailData = {email: "incorrect@email.com"}
      emailSender.add.mockResolvedValueOnce(0);

      // Confirm an error is raised if the email is incorrect
      await expect(authController.resendVerificationEmail(emailData)).rejects.toMatchObject({
        status: 404,
        message: "Incorrect Email"
      });

      // Confirm if the email was already verfied (previous test already made sure it was)
      emailData.email = "johndoe@email.com"
      let result = await authController.resendVerificationEmail(emailData);
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Email already verified');

      // Confirm if the email was sent successfully
      const user = await userService.getByEmail(emailData.email) as User
      await userService.update({id: user.id, isEmailVerified: false}) // Set verfication to false     
      result = await authController.resendVerificationEmail(emailData);
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Verification email sent');
    });
  });

  describe('sendPasswordResetOtp', () => {
    it("Should successfully send password reset otp email", async () => {
      const emailData = {email: "incorrect@email.com"}
      emailSender.add.mockResolvedValueOnce(0);

      // Confirm an error is raised if the email is incorrect
      await expect(authController.sendPasswordResetOtp(emailData)).rejects.toMatchObject({
        status: 404,
        message: "Incorrect Email"
      });

      emailData.email = "johndoe@email.com"
      const result = await authController.sendPasswordResetOtp(emailData);

      // Confirm if the email was sent successfully
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Password otp sent');
    });
  });

  describe('setNewPassword', () => {
    it("Should successfully set a new password successfully", async () => {
      const passwordResetData = {email: "incorrect@email.com", otp: 123456, password: "newtestpassword"}
      emailSender.add.mockResolvedValueOnce(0);

      // Confirm an error is raised if the email is incorrect
      await expect(authController.setNewPassword(passwordResetData)).rejects.toMatchObject({
        status: 404,
        message: "Incorrect Email"
      });

      // Create otp
      passwordResetData.email = "johndoe@email.com"
      const user = await userService.getByEmail(passwordResetData.email) as User
      const otp = await otpService.create(user.id) // Create otp

      // Confirm an error is raised if the otp is incorrect
      await expect(authController.setNewPassword(passwordResetData)).rejects.toMatchObject({
        status: 400,
        message: "Incorrect Otp"
      });

      // Confirm if the password was changed successfully
      passwordResetData.otp = otp.code
      const result = await authController.setNewPassword(passwordResetData);
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Password reset successful');
    });
  });

  describe('login', () => {
    it("Should successfully generate access and refresh tokens for user", async () => {
      const loginData = {email: "incorrect@email.com", password: "incorrect"}

      // Confirm an error is raised if the credentials are incorrect
      await expect(authController.login(loginData)).rejects.toMatchObject({
        status: 401,
        message: "Invalid credentials"
      });
      
      const user = await userService.testUser()
      loginData.email = user.email
      loginData.password = "testpassword"

      // Confirm an error is raised if the user is unverified
      await expect(authController.login(loginData)).rejects.toMatchObject({
        status: 401,
        message: "Verify your email first"
      });
      
      await userService.update({id: user.id, isEmailVerified: true})
      const result = await authController.login(loginData);

      // Confirm if the email was sent successfully
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Login successful');
      expect(result).toHaveProperty('data', {access: expect.any(String), refresh: expect.any(String)});
    });
  });

  describe('refresh', () => {
    it("Should successfully refresh user tokens", async () => {
      const refreshData = {refresh: "invalid-token"}

      // Confirm an error is raised if the token is invalid
      await expect(authController.refresh(refreshData)).rejects.toMatchObject({
        status: 401,
        message: "Refresh token is invalid or expired"
      });
      
      const user = await userService.testVerifiedUser()
      
      const access = authService.createAccessToken({userId: user.id})
      const refresh = authService.createRefreshToken() 
      await userService.update({id: user.id, access: access, refresh: refresh})

      refreshData.refresh = refresh
      const result = await authController.refresh(refreshData);

      // Confirm if the email was sent successfully
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Tokens refresh successful');
      expect(result).toHaveProperty('data', {access: expect.any(String), refresh: expect.any(String)});
    });
  });

  describe('logout', () => {
    it("Should successfully logout user", async () => {
      const request: Record<string,any> = { headers: {Authorization: `Bearer invalid_token`} }
      // Confirm an error is raised if the token is invalid
      await expect(authController.logout(request)).rejects.toMatchObject({
        status: 401,
        message: "Auth token is invalid or expired"
      });
      
      const user = await userService.testVerifiedUser()
      
      const access = authService.createAccessToken({userId: user.id})
      const refresh = authService.createRefreshToken() 
      await userService.update({id: user.id, access: access, refresh: refresh})

      request.headers = {Authorization: `Bearer ${access}`}
      const result = await authController.logout(request);

      // Confirm if the email was sent successfully
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Logout successful');
    });
  });
});