import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import Redis from 'ioredis';
import {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
  RedisOptionsFactory,
} from './redis.type';
import { REDIS_CLIENT, REDIS_OPTIONS } from './redis.constant';
import { RedisService } from './services';

@Global()
@Module({})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  static registerAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: options.imports,
      exports: [RedisService],
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: REDIS_CLIENT,
          useFactory: async (opts: RedisModuleOptions) => {
            const redisClient = new Redis(opts);
            return redisClient;
          },
          inject: [REDIS_OPTIONS],
        },
        RedisService,
      ],
    };
  }

  private static createAsyncProviders(
    options: RedisModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: REDIS_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    return [
      {
        provide: REDIS_OPTIONS,
        useFactory: async (optionsFactory: RedisOptionsFactory) => {
          return await optionsFactory.createRedisOptions();
        },
        inject: [(options.useClass || options.useExisting)!],
      },
    ];
  }

  async onApplicationShutdown(_?: string) {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
