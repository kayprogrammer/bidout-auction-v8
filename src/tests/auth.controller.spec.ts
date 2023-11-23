import { AuthController } from '../controllers/auth.controller';
import { UserService } from '../../prisma/services/accounts.service';
import { PrismaService } from '../prisma.service';
import { RequestError } from '../exceptions.filter';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UserService;
  let emailSender: any

  beforeEach(() => {
    userService = new UserService(new PrismaService());
    emailSender = { add: jest.fn() }
    authController = new AuthController(userService, emailSender);
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
});