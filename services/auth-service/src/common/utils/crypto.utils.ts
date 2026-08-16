import { createHash } from 'crypto';

export const sha256 = (content: string): string =>
  createHash('sha3-256').update(content).digest('hex');
