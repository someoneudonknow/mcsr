const SLUG_PATTERN = /^[a-z][a-z0-9-]{2,62}$/;
const RESERVED_SLUG = new Set([
  'postgres',
  'template0',
  'template1',
  'admin',
  'api',
  'www',
  'app',
  'auth',
  'internal',
  'system',
  'root',
  'public',
  'static',
  'support',
]);

export const normalizeSlug = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);

export const isSlugValid = (input: string): boolean => SLUG_PATTERN.test(input);

export const isSlugReserved = (input: string): boolean =>
  RESERVED_SLUG.has(input);
