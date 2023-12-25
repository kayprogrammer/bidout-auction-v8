import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import settings from './config/config';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptions.filter';
declare const module: any;

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: settings.corsAllowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS", "DELETE"],
    credentials: true,
    allowedHeaders: ["origin", "content-type", "accept", "authorization", "x-request-id", "guestuserid"]
  });

  // Validation pipes to return the errors full detail
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new UnprocessableEntityException({
          message: 'Invalid Entry',
          errors
        });
      },
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle(settings.projectName)
    .setDescription('A simple bidding API built with NestJS')
    .setVersion('8.0')
    .addApiKey({name: "GuestUserId", type: "apiKey", in: "header", description: "For guest watchlists. Get ID from '/api/v8/listings/watchlist' POST endpoint"}, "GuestUserId")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  await app.listen(8000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
