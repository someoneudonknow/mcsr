import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  OrganizationActivatedEvent,
  OrganizationSuspendedEvent,
} from '../interfaces';
import { TenantRefs } from '#entity/tenant_refs.model';
import {
  Identities,
  IdentityProgress,
  IdentityRole,
} from '#entity/identities.model';

@Injectable()
export class OrganizationSyncService {
  private readonly logger = new Logger(OrganizationSyncService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async applyActivated(event: OrganizationActivatedEvent): Promise<void> {
    await this.dataSource.transaction(async (t) => {
      await t.upsert(
        TenantRefs,
        {
          tenantId: event.tenantId,
          slug: event.slug,
          maxSeats: event.maxSeats,
          canAuth: true,
        },
        ['tenantId'],
      );

      await t.update(
        Identities,
        {
          tenantId: event.tenantId,
          role: IdentityRole.OWNER,
          status: IdentityProgress.PENDING,
        },
        { status: IdentityProgress.ACTIVE },
      );
    });
    this.logger.log(`Tenant ${event.tenantId} activated`);
  }

  async applySuspended(event: OrganizationSuspendedEvent): Promise<void> {
    await this.dataSource
      .getRepository(TenantRefs)
      .update({ tenantId: event.tenantId }, { canAuth: false });

    this.logger.log(`Tenant ${event.tenantId} suspended.`);
  }
}
