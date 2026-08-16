import { DAYS, MILLISECONDS, SECONDS_MS } from '#common/constants';
import { CompressionTypes } from 'kafkajs';

export const config = {
  app: {
    port: process.env['APP_PORT'] || 3000,
  },
  db: {
    type: process.env['DB_TYPE'] || 'postgres',
    host: process.env['DB_HOST'] || 'localhost',
    port: process.env['DB_PORT'] || 27017,
    username: process.env['DB_USER'] || 'root',
    password: process.env['DB_PASS'] || 'root',
    database: process.env['DB_NAME'] || 'auth_db',
    synchronize: true,
  },
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: process.env['REDIS_PORT'] || 6379,
    password: process.env['REDIS_PASSWORD'] || '',
    username: process.env['REDIS_USERNAME'] || 'default',
    db: process.env['REDIS_DB'] || 0,
  },
  grpc: {
    organization: {
      url: process.env['ORGANIZATION_GRPC_URL'],
    },
  },
  kafka: {
    brokers: (process.env['KAFKA_BROKERS'] ?? '').split(',') ?? [],
    connectTimeout: 3 * SECONDS_MS,
    requestTimeout: 25 * SECONDS_MS,
    enforceRequestTimeout: true,
    retry: {
      maxRetryTime: 30 * SECONDS_MS,
      initialRetryTime: 300 * MILLISECONDS,
      factor: 0.2,
      retries: 8,
      multiplier: 2,
    },
    producer: {
      idempotent: true, // acks=-1
      compression: CompressionTypes.GZIP,
      allowAutoTopicCreation: false,
    },
    consumer: {
      groupId: process.env['KAFKA_GROUP_ID'],
      sessionTimeout: 30 * SECONDS_MS,
      heartbeatInterval: 3 * SECONDS_MS,
      maxWaitTimeInMs: 1 * SECONDS_MS,
    },
  },
  security: {
    // Session TTL should match the refresh token expiration time, which is 7 days by default.
    sessionTtlSeconds: Number(process.env['SESSION_TTL_SECONDS'] ?? 7 * DAYS),
    jwt: {
      algorithm: 'ES256' as const,
      issuer: process.env['JWT_ISSUER'] || 'mcsr-auth',
      audience: process.env['JWT_AUDIENCE'] || 'mcsr-api',
      accessTokenExpiration:
        process.env['JWT_ACCESS_TOKEN_EXPIRATION'] || '15m',
      refreshTokenExpiration:
        process.env['JWT_REFRESH_TOKEN_EXPIRATION'] || '7d',
    },
  },
};
