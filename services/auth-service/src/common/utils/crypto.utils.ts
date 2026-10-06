import { createHash } from 'crypto';

export const sha3_256 = (content: string): string =>
  createHash('sha3-256').update(content).digest('hex');
