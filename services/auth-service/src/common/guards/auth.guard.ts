import { JwtTokenService, SessionService } from '#auth/services';
import { IS_PUBLIC_KEY, IS_REFRESH_ONLY_KEY } from '#common/decorators';
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
} as const;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler())) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const isRefreshOnly = this.reflector.get<boolean>(
      IS_REFRESH_ONLY_KEY,
      context.getHandler(),
    );

    if (isRefreshOnly) {
      const refreshToken = req.headers[headers.REFRESH_TOKEN] as string;
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is required.');
      }

      const payload = this.jwtTokenService.verify(refreshToken, 'refresh');
      const currentVersion = await this.sessionService.getSessionVersion(
        payload.sub,
      );
      this.sessionService.assertNotRevoked(payload, currentVersion);

      req.user = payload;
      return true;
    }

    const accessToken = req.headers[headers.AUTHORIZATION];
    if (!accessToken) {
      throw new UnauthorizedException('You are not logged in.');
    }

    const [bearer, token] = accessToken.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const payload = this.jwtTokenService.verify(token, 'access');
    const currentVersion = await this.sessionService.getSessionVersion(
      payload.sub,
    );
    this.sessionService.assertNotRevoked(payload, currentVersion);

    req.user = payload;
    return true;
  }
}
