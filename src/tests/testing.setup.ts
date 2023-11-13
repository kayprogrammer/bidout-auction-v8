import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from './prisma.service.mock';

export function createTestingModuleForService(service: any) {
  return Test.createTestingModule({
    providers: [
      service,
      {
        provide: PrismaService,
        useValue: createMockPrismaService(),
      },
    ],
  }).compile();
}
