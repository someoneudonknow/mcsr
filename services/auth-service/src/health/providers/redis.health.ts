import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from 'src/redis/services';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redisService: RedisService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    const mess = await this.redisService.ping();
    const isHealthy = mess === 'PONG';

    if (!isHealthy) {
      return indicator.down();
    }

    return indicator.up();
  }
}
