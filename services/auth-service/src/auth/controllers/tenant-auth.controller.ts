import { TenantRegisterDto, VerifyEmailDto } from '#auth/dtos';
import { TenantAuthService } from '#auth/services';
import { Public, ResponseMessage } from '#common/decorators';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('tenants')
export class TenantAuthController {
  constructor(private readonly tenantAuthService: TenantAuthService) {}

  @Post('/register')
  @Public()
  @ResponseMessage({
    message: 'Workspace created. Check your email to continue.',
    statusCode: 202,
  })
  async signup(@Body() body: TenantRegisterDto) {
    return await this.tenantAuthService.register(body);
  }

  @Post('verify-email')
  @Public()
  @ResponseMessage('Email verified successfully')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return await this.tenantAuthService.verifyEmail(body.token);
  }
}
