# API

Base URL in dev: `http://localhost:3001`

Global prefix `api` with URI versioning (`defaultVersion: 1`), so routes are
`/api/v1/...`. Two paths are excluded from both: `/healthz` and
`/.well-known/jwks.json`.

## Response envelope

Successful responses are wrapped by `SuccessResponseTransformInterceptor`:

```json
{ "message": "User logged in successfully", "code": 200, "metadata": { "...": "handler return value" } }
```

Handlers marked `@NoResponseFormat()` return raw bodies — currently `/healthz`
and the JWKS endpoint, since both must match an external contract.

Errors currently use **Nest's default shape**:

```json
{ "message": "TENANT_BLOCKED", "error": "Not Found", "statusCode": 404 }
```

`message` carries the `ErrorCode` enum value, not a human sentence. A nicer
envelope exists in `common/filters/error-response.filter.ts` but is **not
registered** — see [`operations.md`](./operations.md#known-gaps).

## Endpoints

### `POST /api/v1/tenants/register` · public

Starts tenant signup. Asynchronous: returns no tokens.

```json
// request
{
  "organizationName": "Acme Inc",
  "slug": "acme",                // optional; derived from organizationName
  "email": "owner@acme.test",
  "password": "at-least-12-chars"
}
// 202
{ "tenantId": "0199...", "status": "pending" }
```

| Status | Code | Cause |
|---|---|---|
| 400 | `SLUG_INVALID` | Fails `^[a-z][a-z0-9-]{2,62}$` after normalization |
| 400 | `SLUG_RESERVED` | Reserved word (`admin`, `api`, `postgres`, `www`, …) |
| 409 | `SLUG_TAKEN` | Slug belongs to another organization |
| 503 | — | org-service unreachable |

Password: min 12, max 128 characters. `slug` is normalized (lowercased,
non-alphanumerics collapsed to `-`) before validation, so `"Acme Inc"` becomes
`acme-inc`.

### `POST /api/v1/tenants/verify-email` · public

Consumes the verification token and triggers provisioning.

```json
// request
{ "token": "<raw token from the email>" }
// 200
{ "verified": true }
```

| Status | Code | Cause |
|---|---|---|
| 400 | `VERIFICATION_INVALID` | Unknown token, or already consumed |
| 400 | `VERIFICATION_EXPIRED` | Older than 24h (`VERIFICATION_TTL_MS`) |

Single-use. Only the SHA3-256 hash of the token is stored; the raw value exists
only in the email.

### `POST /api/v1/auth/login` · public

Tenant comes from `X-Tenant-Slug` or the subdomain — **never** from the body.

```json
// request  (+ header X-Tenant-Slug: acme)
{ "email": "owner@acme.test", "password": "..." }
// 200 metadata
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```

| Status | Code | Cause |
|---|---|---|
| 404 | `TENANT_BLOCKED` | Slug missing, malformed, or unknown |
| 403 | `TENANT_NOT_READY` | `can_auth = false`, or identity not `active` |
| 401 | `INVALID_PASSWORD` | Wrong password **or unknown email** — identical by design |

### `POST /api/v1/auth/refresh-token` · refresh token required

```
Header: refresh-token: <token>
```

Returns a new `{ accessToken, refreshToken }`. The old refresh token is
immediately invalid.

| Status | Cause |
|---|---|
| 401 | Missing/invalid token, wrong `typ`, not the current `jti`, revoked, or identity no longer active |
| 403 | **Replay detected** — this `jti` was already used. The session is destroyed; the user must log in again |

### `POST /api/v1/auth/logout` · access token required

```
Header: Authorization: Bearer <access token>
```

Bumps the session version and deletes the session. Kills **all** of that user's
devices, and existing access tokens stop working within the gateway's cache TTL.

### `GET /.well-known/jwks.json` · public, unversioned

Public keys for token verification. `Cache-Control: public, max-age=300`.

```json
{
  "keys": [
    { "kty": "EC", "crv": "P-256", "x": "...", "y": "...",
      "kid": "qqYNKMfz7H0LuFSu", "use": "sig", "alg": "ES256" }
  ]
}
```

Contains both the current and the previous key while a rotation is in flight.
**No entry may ever contain a `d` field** — that would be the private key:

```bash
curl -s localhost:3001/.well-known/jwks.json | jq '.keys[] | has("d")'   # all false
```

### `GET /healthz` · public, unversioned

```json
{ "status": "ok", "info": { "database": { "status": "up" }, "redis": { "status": "up" } }, ... }
```

Returns 503 when a dependency is down. Kafka is **not** checked.

## Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `SLUG_INVALID` | 400 | Malformed workspace address |
| `SLUG_RESERVED` | 400 | Reserved workspace address |
| `SLUG_TAKEN` | 409 | Already in use |
| `TENANT_BLOCKED` | 404 | Tenant unknown or unavailable |
| `TENANT_NOT_READY` | 403 | Still provisioning, suspended, or identity inactive |
| `INVALID_PASSWORD` | 401 | Bad credentials (also returned for unknown email) |
| `VERIFICATION_INVALID` | 400 | Bad or consumed verification token |
| `VERIFICATION_EXPIRED` | 400 | Verification token past its 24h TTL |

`EMAIL_CONFLICT`, `USER_EXIST` and `USER_NOT_FOUND` are declared in
`error.registry.ts` but no longer thrown — leftovers from the single-tenant
design.

## Headers

| Header | Direction | Purpose |
|---|---|---|
| `X-Tenant-Slug` | in | Tenant for login. Dev fallback when there is no wildcard DNS; production uses the subdomain |
| `Authorization: Bearer` | in | Access token |
| `refresh-token` | in | Refresh token, accepted only on the refresh route |
| `X-User-ID` / `X-Tenant-ID` | out of gateway | Set by the gateway from verified claims. **Downstream services must never trust these unless the gateway is the only reachable path** |
