import { LoginDto } from '#auth/dtos/auth.dto';
import { AuthService } from '#auth/services/auth.service';
import { Public, RefreshOnly, TenantSlug } from '#common/decorators';
import { ResponseMessage } from '#common/decorators/response-message.decorator';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh-token')
  @RefreshOnly()
  @ResponseMessage({ message: 'Token refreshed successfully', statusCode: 200 })
  async refreshToken(@Req() req: Request) {
    return await this.authService.refreshTheToken({
      payload: req.user,
    });
  }

  @Post('login')
  @Public()
  @ResponseMessage({ message: 'User logged in successfully', statusCode: 200 })
  async login(@Body() body: LoginDto, @TenantSlug() slug?: string) {
    return await this.authService.login({
      tenantSlug: slug,
      email: body.email,
      password: body.password,
    });
  }

  @Post('logout')
  @ResponseMessage({ message: 'User logged out successfully', statusCode: 200 })
  async logout(@Req() req: Request) {
    return await this.authService.logout(req.user.tid, req.user.sub);
  }
}
