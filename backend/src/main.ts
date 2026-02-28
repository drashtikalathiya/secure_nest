import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const rawBodyParser = raw({ type: 'application/json' });
  const jsonBodyParser = json();

  app.use((req, res, next) => {
    const url = req.originalUrl || req.url || '';
    if (url.includes('/billing/webhook')) {
      return rawBodyParser(req, res, next);
    }
    return jsonBodyParser(req, res, next);
  });

  app.enableCors({ origin: true, credentials: true });
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
