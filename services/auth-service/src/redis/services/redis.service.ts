import { Inject, Injectable } from '@nestjs/common';
import Redis, { RedisKey } from 'ioredis';
import { REDIS_CLIENT } from '../redis.constant';
import { UtilService } from '#common/providers';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly utilService: UtilService,
  ) {}

  async ping() {
    return await this.redisClient.ping();
  }

  async hgetall<T>(key: RedisKey) {
    const data = await this.redisClient.hgetall(key);

    if (this.utilService.isEmptyObject(data)) {
      return null;
    }

    return data as T;
  }

  async hset<T>(key: RedisKey, object: T) {
    return await this.redisClient.hset(key, object as Record<string, any>);
  }

  async sismember(
    key: RedisKey,
    member: string | number | Buffer<ArrayBufferLike>,
  ): Promise<boolean> {
    return Boolean((await this.redisClient.sismember(key, member)) > 0);
  }

  async sadd(
    key: RedisKey,
    members: (string | number | Buffer<ArrayBufferLike>)[],
  ) {
    return await this.redisClient.sadd(key, members);
  }

  async set(key: RedisKey, value: string, ttl?: number) {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: RedisKey) {
    return await this.redisClient.get(key);
  }

  async del(...key: RedisKey[]) {
    return await this.redisClient.del(...key);
  }
}
