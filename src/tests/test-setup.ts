import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailSender } from '../utils/emails.service';
import { EmailSenderMock } from './email-mock';

let app: INestApplication; // Adjust the type based on your app type

export async function setupServer(module: any): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [module],
  })
  .overrideProvider(EmailSender)
  .useValue(EmailSenderMock)
  .compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  return app
}

export async function teardownServer(): Promise<void> {
  if (app) {
    await app.close();
  }
}
