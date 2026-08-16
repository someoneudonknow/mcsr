import { decodePem } from './configuration.utils';

export const buildKey = (prefix: string) => {
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
