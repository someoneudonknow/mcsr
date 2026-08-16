import { Observable } from 'rxjs';

export interface ReserveSlugRequest {
  slug: string;
  organizationName: string;
  ownerIdentityId: string;
  ownerEmail: string;
  idempotencyKey: string;
}

export interface ReserveSlugResponse {
  tenantId: string;
}

export interface ReleaseSlugRequest {
  tenantId: string;
}

export interface ReleaseSlugResponse {
  released: boolean;
}

export interface OrganizationGrpcClient {
  reserveSlug(req: ReserveSlugRequest): Observable<ReserveSlugResponse>;
  releaseSlug(req: ReleaseSlugRequest): Observable<ReleaseSlugRequest>;
}
