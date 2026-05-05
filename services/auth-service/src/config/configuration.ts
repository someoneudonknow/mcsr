// import * as dotenv from 'dotenv';
import { Config, DefaultConfig, ProdConfig } from './configuration.type';
import { deepMerge } from './configuration.utils';
import path from 'node:path';

export const configuration = async (): Promise<Config> => {
  const { config: defaultConfig } = <{ config: DefaultConfig }>(
    await import(path.join(__dirname, 'envs', 'default'))
  );
  const { config: environmentConfig } = <{ config: ProdConfig }>(
    await import(
      path.join(__dirname, 'envs', `${process.env['NODE_ENV'] || 'dev'}`)
    )
  );

  return deepMerge(defaultConfig, environmentConfig);
};
