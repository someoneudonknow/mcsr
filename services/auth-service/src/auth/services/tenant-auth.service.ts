import { TenantRegisterDto, TenantRegisterResponseDto } from '#auth/dtos';
import { ErrorCode } from '#common/exceptions';
import {
  isSlugReserved,
  isSlugValid,
  normalizeSlug,
  sha3_256,
} from '#common/utils';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  ORGANIZATION_PORT,
  OrganizationPort,
  SlugTakenError,
} from 'src/organization/organization.port';
import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import {
  Identities,
  IdentityProgress,
  IdentityRole,
} from '#entity/identities.model';
import { EmailVerifications } from '#entity/email-verifications.model';
import { VERIFICATION_TTL_MS } from '#auth/constants/auth';
import { OutboxEvent } from '#entity/outbox-event.model';
import { AuthEvents } from '#auth/constants/auth.event';

@Injectable()
export class TenantAuthService {
  private readonly logger = new Logger(TenantAuthService.name);

  constructor(
    @InjectDataSource() private readonly datasource: DataSource,
    @Inject(ORGANIZATION_PORT)
    private readonly organizationPort: OrganizationPort,
  ) {}

  async register(dto: TenantRegisterDto): Promise<TenantRegisterResponseDto> {
    const slug = normalizeSlug(dto.slug ?? dto.organizationName);
    if (!isSlugValid(slug)) {
      throw new BadRequestException(ErrorCode.SLUG_INVALID);
    }

    if (isSlugReserved(slug)) {
      throw new BadRequestException(ErrorCode.SLUG_RESERVED);
    }

    const identityId = uuidv7();
    let tenantId: string;

    try {
      const reserved = await this.organizationPort.reserveSlug({
        slug,
        organizationName: dto.organizationName,
        ownerEmail: dto.email,
        ownerIdentityId: identityId,
        idempotencyKey: sha3_256(`${slug}:${dto.email}`),
      });
      tenantId = reserved.tenantId;
    } catch (error: unknown) {
      if (error instanceof SlugTakenError) {
        throw new ConflictException(ErrorCode.SLUG_TAKEN);
      }
      throw error;
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      await bcrypt.genSalt(),
    );
    const rawToken = randomBytes(32).toString('base64url');
    try {
      await this.datasource.transaction(async (m) => {
        await m.insert(Identities, {
          id: identityId,
          tenantId,
          email: dto.email,
          passwordHash,
          role: IdentityRole.OWNER,
          status: IdentityProgress.PENDING,
        });

        await m.insert(EmailVerifications, {
          identityId,
          tokenHash: sha3_256(rawToken),
          expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
        });
      });
    } catch (error) {
      if ((error as { code?: string })?.code === '23505') {
        this.logger.warn(`Duplicate signup for ${dto.email} on ${slug}`);
        return { tenantId, status: 'pending' };
      }

      await this.organizationPort
        .releaseSlug(tenantId)
        .catch((releaseError) => {
          this.logger.error(
            `Failed to release slug ${slug} (${tenantId}): ${releaseError}`,
          );
        });
      throw error;
    }

    // Send verification email here.

    return { tenantId, status: 'pending' };
  }

  async verifyEmail(token: string): Promise<{ verified: true }> {
    const tokenHash = sha3_256(token);

    await this.datasource.transaction(async (m) => {
      const verification = await m.findOne(EmailVerifications, {
        where: {
          tokenHash,
        },
      });

      if (!verification || verification.consumedAt) {
        throw new BadRequestException(ErrorCode.VERIFICATION_INVALID);
      }
      if (verification.expiresAt.getTime() < Date.now()) {
        throw new BadRequestException(ErrorCode.VERIFICATION_EXPIRED);
      }

      const identity = await m.findOneByOrFail(Identities, {
        id: verification.identityId,
      });
      // init now here to ensure time in transaction is the same
      const now = new Date();

      await m.update(EmailVerifications, verification.id, {
        consumedAt: now,
      });
      await m.update(Identities, identity.id, {
        emailVerifiedAt: now,
      });

      // Send outbox and publish this event to kafka -> worker can create database from now
      await m.insert(OutboxEvent, {
        eventType: AuthEvents.OWNER_EMAIL_VERIFIED,
        partitionKey: identity.tenantId,
        payload: {
          tenantId: identity.tenantId,
          identityId: identity.id,
          email: identity.email,
          verifiedAt: now.toISOString(),
        },
      });
    });

    return { verified: true };
  }
}
