import { AuthController } from '../controllers/auth.controller';
import { UserService, OtpService } from '../../prisma/services/accounts.service';
import { PrismaService } from '../prisma.service';
import { RequestError } from '../exceptions.filter';
import { User } from '@prisma/client';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UserService;
  let otpService: OtpService;
  let emailSender: any

  beforeEach(() => {
    userService = new UserService(new PrismaService());
    otpService = new OtpService(new PrismaService());
    emailSender = { add: jest.fn() }
    authController = new AuthController(userService, otpService, emailSender);
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
});