export const redisKey = (domain: string, identifier: string | number) =>
  `auth-service:${domain}:${identifier}`;
