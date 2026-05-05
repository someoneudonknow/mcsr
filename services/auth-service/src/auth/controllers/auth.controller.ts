import { LoginDto, RegisterDto } from '#auth/dtos/auth.dto';
import { AuthService } from '#auth/services/auth.service';
import { Public } from '#common/decorators';
import { ResponseMessage } from '#common/decorators/response-message.decorator';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh-token')
  @ResponseMessage({ message: 'Token refreshed successfully', statusCode: 200 })
  async refreshToken(@Req() req: Request) {
    return await this.authService.refreshTheToken({
      userJwtPayload: req.user,
      refreshToken: req.refreshToken,
      keyToken: req.keyToken,
    });
  }

  @Post('register')
  @Public()
  @ResponseMessage({ message: 'User registered successfully', statusCode: 201 })
  async register(@Body() body: RegisterDto) {
    return await this.authService.register({
      username: body.username,
      password: body.password,
      email: body.email,
    });
  }

  @Post('login')
  @Public()
  @ResponseMessage({ message: 'User logged in successfully', statusCode: 200 })
  async login(@Body() body: LoginDto) {
    return await this.authService.login({
      identifier: body.usernameOrEmail,
      password: body.password,
    });
  }

  @Post('logout')
  @ResponseMessage({ message: 'User logged out successfully', statusCode: 200 })
  async logout(@Req() req: Request) {
    return await this.authService.logout(req.user.userId);
  }
}
