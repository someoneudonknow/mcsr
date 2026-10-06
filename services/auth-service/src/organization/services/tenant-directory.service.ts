import { TenantRefs } from '#entity/tenant_refs.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TenantDirectoryService {
  constructor(
    @InjectRepository(TenantRefs)
    private readonly tenantRefsRepo: Repository<TenantRefs>,
  ) {}

  async findBySlug(slug: string | undefined): Promise<TenantRefs | null> {
    // Guard here as well as in the decorator: an empty value would make
    // TypeORM drop the condition and return an arbitrary tenant.
    if (!slug) {
      return null;
    }
    return await this.tenantRefsRepo.findOneBy({ slug });
  }
}
