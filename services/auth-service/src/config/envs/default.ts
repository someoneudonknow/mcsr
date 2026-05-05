export const config = {
  db: {
    autoLoadEntities: true,
    logging: true,
    entities: [`${__dirname}/../../entity/**/*.{js,ts}`],
  },
  security: {
    jwtAccessTokenExpiration:
      process.env['JWT_ACCESS_TOKEN_EXPIRATION'] || '1d',
    jwtRefreshTokenExpiration:
      process.env['JWT_REFRESH_TOKEN_EXPIRATION'] || '7d',
  },
};
