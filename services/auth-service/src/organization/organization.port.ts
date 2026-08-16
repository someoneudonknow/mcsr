export const ORGANIZATION_PORT = Symbol('organization:port');

export interface ReserverSlugInput {
  slug: string;
  organizationName: string;
  ownerIdentityId: string;
  ownerEmail: string;
  idempotencyKey: string;
}

export interface OrganizationPort {
  reserveSlug(input: ReserverSlugInput): Promise<{ tenantId: string }>;
  releaseSlug(tenantId: string): Promise<void>;
}

export class SlugTakenError extends Error {
  constructor(readonly slug: string) {
    super(`Slug already reserved: ${slug}`);
  }
}
