import { Module } from '@nestjs/common';
import {
  AuthController,
  JwksController,
  TenantAuthController,
} from './controllers';
import {
  AuthService,
  JwtTokenService,
  SessionService,
  TenantAuthService,
} from './services';
import { OrganizationModule } from 'src/organization/organization.module';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [OrganizationModule, IdentityModule],
  controllers: [AuthController, JwksController, TenantAuthController],
  providers: [AuthService, JwtTokenService, SessionService, TenantAuthService],
  exports: [AuthService, JwtTokenService, SessionService],
})
export class AuthModule {}
