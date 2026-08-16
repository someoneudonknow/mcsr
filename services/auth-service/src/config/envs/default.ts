import { buildKey } from '#config/configuration.helpers';

const currentKey = buildKey('JWT_CURRENT');
const previousKey = buildKey('JWT_PREVIOUS');

export const config = {
  db: {
    autoLoadEntities: true,
    logging: true,
    entities: [`${__dirname}/../../entity/**/*.{js,ts}`],
  },
  kafka: {
    clientId: process.env['KAFKA_CLIENT_ID'] ?? 'auth-service',
  },
  security: {
    jwt: {
      activeKid: currentKey?.kid,
      keys: [currentKey, previousKey].filter((key) => !!key),
    },
  },
};
