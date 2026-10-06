import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { middleware } from './app.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const c = app.get(ConfigService);

  // A hybrid app: the Kafka consumer runs in the same process as the HTTP API.
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: c.get<string[]>('kafka.brokers', []),
        clientId: c.get<string>('kafka.clientId', 'auth-service'),
        connectTimeout: c.get<number>('kafka.connectTimeout'),
        requestTimeout: c.get<number>('kafka.requestTimeout'),
        enforceRequestTimeout: c.get<boolean>('kafka.enforceRequestTimeout'),
        retry: {
          maxRetryTime: c.get<number>('kafka.retry.maxRetryTime'),
          initialRetryTime: c.get<number>('kafka.retry.initialRetryTime'),
          factor: c.get<number>('kafka.retry.factor'),
          retries: c.get<number>('kafka.retry.retries'),
          multiplier: c.get<number>('kafka.retry.multiplier'),
        },
      },
      consumer: {
        groupId: c.get<string>('kafka.consumer.groupId', 'auth-service-group'),
        sessionTimeout: c.get<number>('kafka.consumer.sessionTimeout'),
        heartbeatInterval: c.get<number>('kafka.consumer.heartbeatInterval'),
      },
      subscribe: { fromBeginning: false },
    },
  });

  middleware(app);

  app.setGlobalPrefix('api', {
    exclude: ['/healthz', '/.well-known/jwks.json'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.set('trust proxy', true);
  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.listen(c.get<string>('app.port')!);
}
bootstrap();
