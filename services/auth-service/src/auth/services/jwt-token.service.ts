import { JwtKey, TokenType, UserJwtPayload } from '#auth/interfaces';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicKey, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtTokenService {
  private readonly keys: ReadonlyMap<string, JwtKey>;
  private readonly activeKey: JwtKey & { privateKey: string };

  constructor(private readonly configService: ConfigService) {
    const keys = this.configService.get<JwtKey[]>('security.jwt.keys') ?? [];
    const activeKid = this.configService.get<string>('security.jwt.activeKid');

    this.keys = new Map(keys.map((key) => [key.kid, key]));
    const active = activeKid ? this.keys.get(activeKid) : undefined;
    if (!active?.privateKey) {
      throw new Error(
        'No JWT signing key configured. Set JWT_CURRENT_KID / _PRIVATE_KEY / _PUBLIC_KEY.',
      );
    }

    this.activeKey = active as JwtKey & { privateKey: string };
  }

  getJwks(): { keys: JsonWebKey[] } {
    return {
      keys: [...this.keys.values()].map((key) => ({
        ...createPublicKey(key.publicKey).export({ format: 'jwk' }),
        kid: key.kid,
        use: 'sig',
        alg: this.configService.get<string>('security.jwt.algorithm'),
      })),
    };
  }

  signTokenPair(
    user: { sub: string; email: string; tid: string },
    sessionVersion: number,
  ) {
    const base = { ...user, sv: sessionVersion };
    const refreshJti = randomUUID();

    return {
      accessToken: this.sign(
        {
          ...base,
          typ: 'access' as const,
          jti: randomUUID(),
        },
        this.configService.get('security.jwt.accessTokenExpiration')!,
      ),
      refreshToken: this.sign(
        {
          ...base,
          typ: 'refresh' as const,
          jti: refreshJti,
        },
        this.configService.get<string>('security.jwt.refreshTokenExpiration')!,
      ),
      refreshJti,
    };
  }

  verify(token: string, expectedType: TokenType): UserJwtPayload {
    // decode the token to get kid
    // from kid -> get key by kid
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded?.header?.kid;
    if (!kid) {
      throw new UnauthorizedException('Token is missing a key id');
    }

    const key = this.keys.get(kid);
    if (!key) {
      throw new UnauthorizedException('Unknown signing key.');
    }

    let payload: UserJwtPayload;
    try {
      payload = jwt.verify(token, key.publicKey, {
        algorithms: [
          (this.configService.get<string>(
            'security.jwt.algorithm',
          ) as jwt.SignOptions['algorithm'])!,
        ],
        issuer: this.configService.get<string>('security.jwt.issuer'),
        audience: this.configService.get<string>('security.jwt.audience'),
      }) as UserJwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload.typ !== expectedType) {
      throw new UnauthorizedException(
        `Invalid token type. Expected ${expectedType}, got ${payload.typ}`,
      );
    }

    return payload;
  }

  private sign(payload: UserJwtPayload, expiresIn: string) {
    return jwt.sign(payload, this.activeKey.privateKey, {
      algorithm: this.configService.get<string>(
        'security.jwt.algorithm',
      ) as jwt.SignOptions['algorithm'],
      keyid: this.activeKey.kid,
      issuer: this.configService.get<string>('security.jwt.issuer'),
      audience: this.configService.get<string>('security.jwt.audience'),
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}
