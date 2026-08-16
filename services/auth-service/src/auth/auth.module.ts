import { Module } from '@nestjs/common';
import { AuthController, JwksController } from './controllers';
import { AuthService, JwtTokenService, SessionService } from './services';
import { UserModule } from '#user/user.module';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  imports: [UserModule, OrganizationModule],
  controllers: [AuthController, JwksController],
  providers: [AuthService, JwtTokenService, SessionService],
  exports: [AuthService, JwtTokenService, SessionService],
})
export class AuthModule {}
