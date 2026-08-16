import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { ClientGrpc } from '@nestjs/microservices';
import { ORGANIZATION_GRPC_PACKAGE } from '../constants';
import {
  OrganizationPort,
  ReserverSlugInput,
  SlugTakenError,
} from '../organization.port';
import { OrganizationGrpcClient } from './organization.grpc.interfaces';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

const ORGANIZATION_GRPC_TIMEOUT = 2000;

@Injectable()
export class OrganizationGrpcAdapter implements OrganizationPort, OnModuleInit {
  private readonly logger = new Logger(OrganizationGrpcAdapter.name);
  private client!: OrganizationGrpcClient;

  constructor(@Inject('ORGANIZATION_GRPC') private readonly grpc: ClientGrpc) {}

  onModuleInit() {
    this.client = this.grpc.getService<OrganizationGrpcClient>(
      ORGANIZATION_GRPC_PACKAGE,
    );
  }

  async reserveSlug(input: ReserverSlugInput): Promise<{ tenantId: string }> {
    try {
      const response = await firstValueFrom(
        this.client
          .reserveSlug({
            slug: input.slug,
            organizationName: input.organizationName,
            ownerEmail: input.ownerEmail,
            ownerIdentityId: input.ownerIdentityId,
            idempotencyKey: input.idempotencyKey,
          })
          .pipe(timeout(ORGANIZATION_GRPC_TIMEOUT)),
      );

      return { tenantId: response.tenantId };
    } catch (error: unknown) {
      throw this.exceptionTranslate(error);
    }
  }

  async releaseSlug(tenantId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.client
          .releaseSlug({
            tenantId: tenantId,
          })
          .pipe(timeout(ORGANIZATION_GRPC_TIMEOUT)),
      );
    } catch (error: unknown) {
      throw this.exceptionTranslate(error);
    }
  }

  private exceptionTranslate(error: unknown, slug?: string): Error {
    if (error instanceof TimeoutError) {
      return new ServiceUnavailableException('Organization service timeout.');
    }

    const code = (error as { code?: number })?.code;

    if (code === GrpcStatus.ALREADY_EXISTS && slug) {
      return new SlugTakenError(slug);
    }

    if (code === GrpcStatus.UNAVAILABLE || GrpcStatus.DEADLINE_EXCEEDED) {
      return new ServiceUnavailableException(
        'Organization service unavailable.',
      );
    }

    return error instanceof Error ? error : new Error(String(error));
  }
}
