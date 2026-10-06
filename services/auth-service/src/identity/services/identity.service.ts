import {
  Identities,
  IdentityProgress,
  IdentityRole,
} from '#entity/identities.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identities)
    private readonly identityRepo: Repository<Identities>,
  ) {}

  // Always scoped by tenant: an email is only unique within one tenant.
  async findByTenantAndEmail(
    tenantId: string,
    email: string,
  ): Promise<Identities | null> {
    return await this.identityRepo.findOneBy({ tenantId, email });
  }

  async findById(id: string): Promise<Identities | null> {
    return await this.identityRepo.findOneBy({ id });
  }

  // role=OWNER is deliberate: activating a tenant must never sweep up invited
  // members who are pending for an unrelated reason.
  async activateOwner(tenantId: string): Promise<void> {
    await this.identityRepo.update(
      {
        tenantId,
        role: IdentityRole.OWNER,
        status: IdentityProgress.PENDING,
      },
      { status: IdentityProgress.ACTIVE },
    );
  }
}
