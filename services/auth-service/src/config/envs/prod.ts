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
    synchronize: false,
  },
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: process.env['REDIS_PORT'] || 6379,
    password: process.env['REDIS_PASSWORD'] || '',
    username: process.env['REDIS_USERNAME'] || 'default',
    db: process.env['REDIS_DB'] || 0,
  },
};
