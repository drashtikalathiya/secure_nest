import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const rawBodyParser = bodyParser.raw({ type: 'application/json' });
  const jsonBodyParser = bodyParser.json();

  app.use((req, res, next) => {
    if (req.originalUrl === '/billing/webhook') {
      return rawBodyParser(req, res, next);
    }
    return jsonBodyParser(req, res, next);
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
