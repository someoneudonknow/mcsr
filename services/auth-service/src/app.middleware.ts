import { INestApplication } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';

export const middleware = (app: INestApplication): INestApplication => {
  const isProduction = process.env['NODE_ENV'] === 'prod';

  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: isProduction ? undefined : false,
    }),
  );

  return app;
};
