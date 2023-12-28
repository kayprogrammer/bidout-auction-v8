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
      disableErrorMessages: false,
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
  SwaggerModule.setup('', app, document, {
      customSiteTitle: settings.projectName,
      customfavIcon: 'https://avatars.githubusercontent.com/u/6936373?s=200&v=4',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
      ],
  });

  await app.listen(8000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
