import { KeyTokenService } from '#auth/services';
import { IS_PUBLIC_KEY } from '#common/decorators';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

const headers = {
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'refresh-token',
  X_CLIENT_ID: 'x-client-id',
} as const;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly keyTokenService: KeyTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();

    const clientId = req.headers[headers.X_CLIENT_ID];
    if (!clientId) {
      throw new UnauthorizedException('Client ID is required.');
    }

    const accessToken = req.headers[headers.AUTHORIZATION];
    if (!accessToken) {
      throw new UnauthorizedException('You are not logged in.');
    }

    const refreshToken = req.headers[headers.REFRESH_TOKEN] as string;

    const [bearer, token] = accessToken.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const keyToken = await this.keyTokenService.findKeyTokenByUserId(
      clientId as string,
    );
    if (!keyToken) {
      throw new UnauthorizedException("You're not logged in.");
    }

    if (refreshToken) {
      const decodedRefreshToken = this.keyTokenService.verifyJWTToken(
        refreshToken,
        keyToken.publicKey,
      );
      if (!decodedRefreshToken) {
        throw new UnauthorizedException('Invalid token.');
      }

      req.user = decodedRefreshToken;
      req.refreshToken = refreshToken;
      req.keyToken = keyToken;

      return true;
    }

    const decodedAccessToken = this.keyTokenService.verifyJWTToken(
      token,
      keyToken.publicKey,
    );
    if (!decodedAccessToken) {
      throw new UnauthorizedException('Invalid token.');
    }

    req.user = decodedAccessToken;
    req.keyToken = keyToken;

    return true;
  }
}
