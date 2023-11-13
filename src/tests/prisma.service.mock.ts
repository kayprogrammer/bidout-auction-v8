export function createMockPrismaService() {
    return {
      siteDetail: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      // Add mock methods for other models used across services
    };
  }
  