import { AuthRedisKey } from '#auth/constants/auth.redis-keys';
import { Injectable, Logger } from '@nestjs/common';
import crypto from 'node:crypto';
import { RedisService } from 'src/redis/services';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { KeyTokenData, UserJwtPayload } from '#auth/interfaces';

@Injectable()
export class KeyTokenService {
  private readonly logger = new Logger(KeyTokenService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async updateKeyToken(
    userId: string,
    keyTokenData: Partial<KeyTokenData>,
  ): Promise<boolean> {
    try {
      const keyToken = AuthRedisKey.keyToken(userId);
      await this.redisService.hset(keyToken, keyTokenData);
      return true;
    } catch (_) {
      return false;
    }
  }

  async appendRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const rfTokenUsed = AuthRedisKey.refreshTokenUsed(userId);
    const result = await this.redisService.sadd(rfTokenUsed, [refreshToken]);
    return Boolean(result > 0);
  }

  async findKeyTokenByUserId(userId: string): Promise<KeyTokenData | null> {
    const keyToken = await this.redisService.hgetall<KeyTokenData>(
      AuthRedisKey.keyToken(userId),
    );
    return keyToken;
  }

  async isRefreshTokenUsed(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const rfTokenUsed = AuthRedisKey.refreshTokenUsed(userId);
    const used = await this.redisService.sismember(rfTokenUsed, refreshToken);
    return used;
  }

  verifyJWTToken(token: string, publicKey: string): UserJwtPayload {
    return jwt.verify(token, publicKey) as UserJwtPayload;
  }

  createJWTTokenPair(
    tokenPayload: UserJwtPayload,
    privateKey: string,
  ): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(tokenPayload, privateKey, {
      algorithm: 'RS256',
      expiresIn: this.configService.get('security.jwtAccessTokenExpiration'),
    });

    const refreshToken = jwt.sign(tokenPayload, privateKey, {
      algorithm: 'RS256',
      expiresIn: this.configService.get('security.jwtRefreshTokenExpiration'),
    });

    return { accessToken, refreshToken };
  }

  generateRSAKeyPair(): crypto.KeyPairSyncResult<string, string> {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
    });
  }

  async cleanKeyToken(userId: string): Promise<boolean> {
    const keyToken = AuthRedisKey.keyToken(userId);
    const rfTokenUsed = AuthRedisKey.refreshTokenUsed(userId);

    const result = await this.redisService.del(keyToken, rfTokenUsed);
    this.logger.log(
      `Key token cleaned for user ${userId} with result ${result}`,
    );
    return Boolean(result > 0);
  }

  async createKeyToken(keyTokenData: KeyTokenData): Promise<boolean> {
    const keyToken = AuthRedisKey.keyToken(keyTokenData.userId);
    const result = await this.redisService.hset(keyToken, keyTokenData);

    this.logger.log(
      `Key token created for user ${keyTokenData.userId} with result ${result}`,
    );

    return Boolean(result > 0);
  }
}
