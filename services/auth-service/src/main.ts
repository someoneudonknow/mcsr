import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { middleware } from './app.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  middleware(app);

  app.setGlobalPrefix('api', {
    exclude: ['/health'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.set('trust proxy', true);
  app.enableShutdownHooks();

  await app.listen(process.env['APP_PORT']);
}
bootstrap();
