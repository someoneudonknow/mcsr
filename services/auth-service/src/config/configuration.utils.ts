import { JwtKey } from '#auth/interfaces';
import { decodeBase64 } from '#common/utils';
import { ObjectType } from './configuration.type';

export const isObject = (value: any): value is ObjectType => {
  return value && typeof value === 'object' && !Array.isArray(value);
};

export const deepMerge = <T extends ObjectType, U extends ObjectType>(
  target: T,
  source: U,
): T & U => {
  const result: ObjectType = { ...target };

  for (const key in source) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (isObject(sourceVal) && isObject(targetVal)) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else {
      result[key] = sourceVal;
    }
  }

  return result as T & U;
};

export const decodePem = (value?: string) =>
  value ? decodeBase64(value) : undefined;

export const buildKey = (prefix: string): JwtKey | null => {
  const kid = process.env[`${prefix}_KID`];
  const publicKey = decodePem(process.env[`${prefix}_PUBLIC_KEY`]);

  if (!kid || !publicKey) {
    return null;
  }

  return {
    kid,
    publicKey,
    privateKey: decodePem(process.env[`${prefix}_PRIVATE_KEY`]),
  };
};
