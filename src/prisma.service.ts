import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import settings from './config/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
            url: process.env.NODE_ENV === "test" ? settings.testDatabaseUrl : settings.databaseUrl,
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect()
  }
}
