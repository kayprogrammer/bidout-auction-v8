import { setupPostgres, teardownPostgres } from 'jest-postgres';
const { PrismaClient } = require('@prisma/client');

module.exports = async () => {
  await setupPostgres(); // Set up the Postgres instance for testing

  process.env.TEST_DATABASE_URL = process.env.JEST_POSTGRES_URL; // Set test database URL
};

module.exports.teardown = async () => {
  await teardownPostgres(); // Teardown the Postgres instance after all tests

  if (global.prisma) {
    await global.prisma.$disconnect(); // Disconnect Prisma client after all tests
  }
};

// Initialize a Prisma client to use in your tests
global.prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.TEST_DATABASE_URL },
  },
});
