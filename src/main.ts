import 'dotenv/config'; // This loads the .env file at the start
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have any decorators
    transform: true, // Transform payloads to be objects typed according to their DTO classes
    forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
  }));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
