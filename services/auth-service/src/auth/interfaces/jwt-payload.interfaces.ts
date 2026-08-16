export type TokenType = 'access' | 'refresh';

export interface UserJwtPayload {
  sub: string;
  email: string;
  typ: TokenType;
  // The unique identifier for the token. This is used to prevent replay attacks.
  jti: string;
  sv: number;
  // Don't be confuse this is the tenant id
  tid: number;
}

export type JwtKey = { kid: string; publicKey: string; privateKey?: string };
