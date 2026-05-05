import { redisKey } from '#common/constants';

export const AuthRedisKey = {
  keyToken: (userId: string | number) => redisKey('key-token', userId),
  refreshTokenUsed: (userId: string | number) =>
    redisKey('refresh-token:used', userId),
};
