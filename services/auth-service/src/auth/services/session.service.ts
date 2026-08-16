import { AuthRedisKey } from '#auth/constants/auth.redis-keys';
import { SessionData, UserJwtPayload } from '#auth/interfaces';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/services';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private get sessionTtl(): number {
    return this.configService.get<number>('security.sessionTtlSeconds')!;
  }

  async start(userId: string, refreshJti: string): Promise<void> {
    await this.redisService.del(AuthRedisKey.refreshTokenUsed(userId));
    await this.redisService.hset(
      AuthRedisKey.session(userId),
      { refreshJti },
      this.sessionTtl,
    );
  }

  async getSessionVersion(userId: string): Promise<number> {
    const raw = this.redisService.get(AuthRedisKey.sessionVersion(userId));
    return raw ? Number(raw) : 0;
  }

  async bumpSessionVersion(userId: string): Promise<number> {
    const next = await this.redisService.incr(
      AuthRedisKey.sessionVersion(userId),
    );
    this.logger.log(`Session version bumped to ${next} for user #${userId}`);
    return next;
  }

  assertNotRevoked(payload: UserJwtPayload, currentVersion: number): void {
    if (payload.sv < currentVersion) {
      throw new UnauthorizedException('Session has been revoked.');
    }
  }

  async rotate(
    userId: string,
    usedJti: string,
    nextJti: string,
  ): Promise<void> {
    await this.redisService.sadd(
      AuthRedisKey.refreshTokenUsed(userId),
      [usedJti],
      this.sessionTtl,
    );
    await this.redisService.hset(
      AuthRedisKey.session(userId),
      { refreshJti: nextJti },
      this.sessionTtl,
    );
  }

  async end(userId: string): Promise<void> {
    await this.redisService.del(
      AuthRedisKey.session(userId),
      AuthRedisKey.refreshTokenUsed(userId),
    );
    this.logger.log(`Session ended for user ${userId}`);
  }

  async isRefreshJtiUsed(userId: string, refreshJti: string): Promise<boolean> {
    return await this.redisService.sismember(
      AuthRedisKey.refreshTokenUsed(userId),
      refreshJti,
    );
  }

  async find(userId: string): Promise<SessionData | null> {
    return await this.redisService.hgetall<SessionData>(
      AuthRedisKey.session(userId),
    );
  }
}
