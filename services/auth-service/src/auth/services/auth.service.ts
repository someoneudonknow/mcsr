import { AuthResponseDto } from '#auth/dtos/auth.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserJwtPayload } from '#auth/interfaces';
import { JwtTokenService } from './jwt-token.service';
import { SessionService } from './session.service';
import { Identities, IdentityProgress } from '#entity/identities.model';
import { ErrorCode } from '#common/exceptions';
import { IdentityService } from 'src/identity/services';
import { TenantDirectoryService } from 'src/organization/services';

// Compared against when the email is unknown, so a miss costs the same bcrypt
// time as a hit. Without it, response latency reveals which emails exist.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('timing-equaliser', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionService: SessionService,
    private readonly tenantDirectoryService: TenantDirectoryService,
    private readonly identityService: IdentityService,
  ) {}

  async refreshTheToken({ payload }: { payload: UserJwtPayload }) {
    const { tid: tenantId, sub: userId, jti } = payload;

    if (await this.sessionService.isRefreshJtiUsed(tenantId, userId, jti)) {
      await this.logout(tenantId, userId);
      throw new ForbiddenException(
        'There was some suspicious behaviour in your account! Please log in again!',
      );
    }

    const session = await this.sessionService.find(tenantId, userId);
    if (!session || session.refreshJti !== jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const currentVersion = await this.sessionService.getSessionVersion(
      tenantId,
      userId,
    );
    this.sessionService.assertNotRevoked(payload, currentVersion);

    // Look up by id, not email: the id is the stable identity, email can change.
    // Re-check tenant and status so a suspended account cannot keep refreshing.
    const identity = await this.identityService.findById(userId);
    if (
      !identity ||
      identity.tenantId !== tenantId ||
      identity.status !== IdentityProgress.ACTIVE
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken, refreshJti } =
      this.jwtTokenService.signTokenPair(
        { sub: identity.id, email: identity.email, tid: tenantId },
        currentVersion,
      );

    await this.sessionService.rotate(tenantId, userId, jti, refreshJti);

    return { accessToken, refreshToken };
  }

  async logout(tenantId: string, userId: string) {
    if (!tenantId || !userId) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    await this.sessionService.bumpSessionVersion(tenantId, userId);
    await this.sessionService.end(tenantId, userId);
    return true;
  }

  async login({
    tenantSlug,
    email,
    password,
  }: {
    tenantSlug: string | undefined;
    email: string;
    password: string;
  }): Promise<AuthResponseDto> {
    const tenant = await this.tenantDirectoryService.findBySlug(tenantSlug);
    if (!tenant) {
      throw new NotFoundException(ErrorCode.TENANT_BLOCKED);
    }

    // Provisioning not finished, or org suspended. Distinct from a bad
    // password - this window can last minutes after signup.
    if (!tenant.canAuth) {
      throw new ForbiddenException(ErrorCode.TENANT_NOT_READY);
    }

    const identity = await this.identityService.findByTenantAndEmail(
      tenant.tenantId,
      email,
    );

    // Always run bcrypt, and answer an unknown email exactly like a wrong
    // password. Otherwise message or latency reveals who has an account.
    const isMatch = await bcrypt.compare(
      password,
      identity?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!identity || !isMatch) {
      throw new UnauthorizedException(ErrorCode.INVALID_PASSWORD);
    }

    // Only after the password is proven: checking status first would confirm
    // a pending account exists to someone who does not know its password.
    if (identity.status !== IdentityProgress.ACTIVE) {
      throw new ForbiddenException(ErrorCode.TENANT_NOT_READY);
    }

    return await this.issueSession(identity);
  }

  private async issueSession(identity: Identities): Promise<AuthResponseDto> {
    const sessionVersion = await this.sessionService.getSessionVersion(
      identity.tenantId,
      identity.id,
    );
    const { accessToken, refreshToken, refreshJti } =
      this.jwtTokenService.signTokenPair(
        {
          sub: identity.id,
          email: identity.email,
          tid: identity.tenantId,
        },
        sessionVersion,
      );
    await this.sessionService.start(identity.tenantId, identity.id, refreshJti);

    return { accessToken, refreshToken };
  }
}
