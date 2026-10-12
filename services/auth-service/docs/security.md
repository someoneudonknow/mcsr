# Security design

## Token model

One **ES256 (ECDSA P-256)** key pair for the whole system, held only by
auth-service. The public half is published at `/.well-known/jwks.json`, and the
gateway verifies tokens locally against it — no call back to auth-service.

ES256 was chosen over RSA (64-byte signatures instead of 512, microsecond key
generation) and over Ed25519 because neither `jsonwebtoken` nor `lua-resty-jwt`
— the gateway's verifier — implements EdDSA.

### Claims

```json
{
  "sub": "0199a1...",            // identity id — also the PK of core.users in the tenant DB
  "email": "owner@acme.test",
  "tid": "0199b2...",            // tenant id
  "typ": "access",               // or "refresh"
  "jti": "e7c1...",              // unique per token
  "sv": 0,                       // session version at issue time
  "iss": "mcsr-auth",
  "aud": "mcsr-api",
  "iat": 1760000000,
  "exp": 1760000900
}
```

Header carries `kid`, which tells a verifier which published key to use.

| Claim | Why it exists |
|---|---|
| `typ` | A refresh token cannot be used as an access token, enforced inside the token rather than by route config — so the gateway can check it without knowing your routes |
| `jti` | Refresh rotation compares ids, not whole token strings; also what a denylist would key on |
| `sv` | Instant revocation without a per-request database lookup |
| `tid` | Tenant isolation. With database-per-tenant this does not just filter rows, it selects which database to connect to |

### What is deliberately not in the token

**Tier.** It changes independently of sessions, and a 15-minute-stale tier means
a downgrade takes 15 minutes to apply. Services that need it ask org-service.

More generally: auth-service never opens a tenant database connection, so any
claim sourced from tenant data could not be signed at login time anyway.

### Verification rules

`JwtTokenService.verify` always checks, in order:

1. `kid` present, and known in the in-memory key map — unknown `kid` is rejected
2. Signature, with **the algorithm pinned** to the configured value
3. `iss` and `aud`
4. `exp` (by `jsonwebtoken`)
5. `typ` matches what the caller expects

Pinning the algorithm is not optional. Without it, an attacker takes the
*published* public key, re-signs the token as `HS256` using that key as the HMAC
secret, and the library validates it. Publishing keys at a JWKS endpoint makes
this remotely exploitable, so the pin is what makes JWKS safe.

Reading `kid` from the unverified header is safe **only** because it is used
solely as a lookup into a fixed set. It never selects an algorithm or a secret.

## Revocation

Stateless JWTs cannot be withdrawn, so access tokens are short-lived (`15m`
recommended; check `JWT_ACCESS_TOKEN_EXPIRATION`) and backed by a session-version
counter for the cases where waiting is not acceptable.

```
auth-service:session-version:<tenantId>:<userId>  ->  integer
```

- Written with `INCR`. Absent means `0`, i.e. never revoked.
- Every token embeds the value as `sv`.
- A token is revoked when `token.sv < stored value`.
- Bumped by: logout, refresh-token replay detection. Should also be bumped by
  password change, email change, account disable and admin force-logout once
  those endpoints exist.

**This counter must never be deleted or reset.** It lives in its own Redis key,
outside the session hash, and `SessionService.end()` must not touch it. If logout
deleted it, the next read would return `0` and an access token issued seconds
earlier would become valid again — a revocation system that un-revokes. That is
also why it has no TTL: a few bytes per user, and the invariant is that the
counter outlives every token carrying a copy of it.

### Who enforces what

| Path | Enforced by | Latency |
|---|---|---|
| Live access tokens | Gateway plugin reads `session-version` from Redis, cached a few seconds | seconds |
| New logins | `tenant_refs.can_auth` in auth's Postgres, updated by Kafka event | event lag |
| Tenant suspension, live tokens | Gateway reads `gateway:tenant-status:<tenantId>`, written **synchronously** by org-service | seconds |

Two paths with two consistency requirements, and the strict one never depends on
the loose one. `tenant_refs` being stale only delays *new* logins; it can never
let a suspended tenant keep working.

The gateway's Redis user must be scoped to read-only on those two prefixes:

```bash
redis-cli ACL SETUSER apisix-gw on '>STRONG_PASSWORD' \
  '~auth-service:session-version:*' '~gateway:tenant-status:*' \
  +get +mget +ping
```

Verify it is actually constrained — this is the test that matters:

```bash
redis-cli --user apisix-gw --pass STRONG_PASSWORD GET 'auth-service:session:x:y'
# expect: NOPERM
```

## Password and token storage

| Secret | Stored as |
|---|---|
| Password | bcrypt, cost 10 (`genSalt()` default) |
| Verification token | SHA3-256 hash; raw value only in the email |
| Signing private key | Base64-encoded PEM in env / secret store. **Never in Redis or Postgres** |

The private key living only in configuration is the point of the design. An
earlier version generated a 4096-bit RSA key pair per user and stored both halves
in Redis, which made Redis — an unauthenticated, snapshotted, replicated cache —
able to mint a token for any user. A verifier must never be able to sign.

## Key rotation runbook

Two configured slots: `JWT_CURRENT_*` signs and verifies, `JWT_PREVIOUS_*`
verifies only. No downtime, no forced logouts, no code change.

1. Generate a new pair (the snippet in [`README.md`](./README.md#quick-start)).
2. Move the current values into `JWT_PREVIOUS_KID` / `JWT_PREVIOUS_PUBLIC_KEY`.
   **Leave `JWT_PREVIOUS_PRIVATE_KEY` empty** — a retiring key must not be able
   to sign, and `JwtKey.privateKey?` being optional is what enforces that.
3. Put the new values in `JWT_CURRENT_*`.
4. Restart. New tokens carry the new `kid`; old tokens keep verifying because
   both keys appear in JWKS.
5. After the refresh-token TTL (default 7 days), drop the `JWT_PREVIOUS_*` block.

Propagation is bounded by the JWKS `max-age=300` plus the gateway's refresh
interval, so allow ~10 minutes before assuming every verifier has the new key.

Check what is currently published:

```bash
curl -s localhost:3001/.well-known/jwks.json | jq '.keys[].kid'
```

## Gateway contract

The gateway is the only component that should be reachable from outside, and it
must, in this order:

1. **Strip inbound `X-User-ID` and `X-Tenant-ID` unconditionally**, on every
   route including public ones. A client-supplied `X-Tenant-ID` is cross-tenant
   data access, not merely impersonation.
2. Verify the token (signature, `kid`, `iss`, `aud`, `exp`, `typ=access`).
3. Check `session-version` and `gateway:tenant-status`.
4. Only then set `X-User-ID` / `X-Tenant-ID` from verified claims.

Step 1 fails silently and catastrophically if omitted, and no functional test
will reveal it — it has to be attacked deliberately:

```bash
curl -H "Authorization: Bearer $TOKEN" -H 'X-User-ID: 00000000-0000-0000-0000-000000000000' \
  http://gateway/spatial/whoami
# the backend must see the real sub, not the injected value
```

This guarantee is only as strong as the network: if a domain service is reachable
directly, anyone can set both headers freely. Services must be unreachable except
through the gateway (internal-only network, plus mTLS or a shared gateway secret).
