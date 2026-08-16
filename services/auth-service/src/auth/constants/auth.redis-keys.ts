import { redisKey } from '#common/constants';

export const AuthRedisKey = {
  session: (userId: string | number) => redisKey('session', userId),
  refreshTokenUsed: (userId: string | number) =>
    redisKey('refresh-token:used', userId),
  sessionVersion: (userId: string | number) =>
    redisKey('session-version', userId),
};
