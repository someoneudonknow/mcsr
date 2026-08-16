import { Global, Module } from '@nestjs/common';
import {
  ClientProvider,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KAFKA_CLIENT } from './constants';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_CLIENT,
        imports: [ConfigModule],
        useFactory: (c: ConfigService): ClientProvider => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                brokers: c.get<string[]>('kafka.brokers', []),
                clientId: c.get<string>('kafka.clientId', ''),
                connectTimeout: c.get<number>('kafka.connectTimeout'),
                requestTimeout: c.get<number>('kafka.requestTimeout'),
                enforceRequestTimeout: c.get<boolean>(
                  'kafka.enforceRequestTimeout',
                ),
                retry: {
                  maxRetryTime: c.get<number>('kafka.retry.maxRetryTime'),
                  initialRetryTime: c.get<number>(
                    'kafka.retry.initialRetryTime',
                  ),
                  factor: c.get<number>('kafka.retry.factor'),
                  retries: c.get<number>('kafka.retry.retries'),
                  multiplier: c.get<number>('kafka.retry.multiplier'),
                },
              },
              producer: {
                allowAutoTopicCreation: c.get<boolean>(
                  'kafka.producer.allowAutoTopicCreation',
                ),
                idempotent: c.get<boolean>('kafka.producer.idempotent'),
              },
              consumer: {
                groupId: c.get<string>('kafka.consumer.groupId'),
                sessionTimeout: c.get<number>('kafka.consumer.sessionTimeout'),
                heartbeatInterval: c.get<number>(
                  'kafka.consumer.heartbeatInterval',
                ),
                maxWaitTimeInMs: c.get<number>(
                  'kafka.consumer.maxWaitTimeInMs',
                ),
              },
            },
          } as ClientProvider;
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
