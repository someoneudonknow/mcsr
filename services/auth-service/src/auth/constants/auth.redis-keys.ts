import { redisKey } from '#common/constants';

export const AuthRedisKey = {
  session: (tenantId: string, userId: string) =>
    redisKey('session', `${tenantId}:${userId}`),
  refreshTokenUsed: (tenantId: string, userId: string) =>
    redisKey('refresh-token:used', `${tenantId}:${userId}`),
  sessionVersion: (tenantId: string, userId: string) =>
    redisKey('session-version', `${tenantId}:${userId}`),
};
