import { JwtTokenService } from '#auth/services';
import { NoResponseFormat, Public } from '#common/decorators';
import { Controller, Get, Header, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  path: '.well-known',
  version: VERSION_NEUTRAL,
})
export class JwksController {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  @Get('jwks.json')
  @Public()
  @NoResponseFormat()
  @Header('Cache-Control', 'public, max-age=300')
  getJwks() {
    return this.jwtTokenService.getJwks();
  }
}
