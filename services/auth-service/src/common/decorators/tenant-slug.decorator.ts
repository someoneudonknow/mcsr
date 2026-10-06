import { isSlugValid } from '#common/utils';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Subdomain in production (acme.geomessage.com), header fallback for local dev
// where there is no wildcard DNS.
//
// Returns undefined for anything that is not a well-formed slug. Callers MUST
// reject undefined: TypeORM drops `undefined` from a WHERE clause, so
// findOneBy({ slug: undefined }) matches the first row in the table.
export const TenantSlug = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const header = req.headers['x-tenant-slug'];
    const candidate =
      typeof header === 'string' && header.length > 0
        ? header
        : req.hostname.split('.')[0];

    const slug = candidate?.trim().toLowerCase();
    return slug && isSlugValid(slug) ? slug : undefined;
  },
);
