---
id: authentication
title: Authentication
sidebar_position: 6
description: "API keys (sk-) call models; management keys (mk-) administer your account. Send either in the Authorization header."
---

# Authentication

The Router accepts two kinds of credentials, distinguished by prefix:

| Key type           | Prefix | What it's for                                                                                 |
| ------------------ | ------ | --------------------------------------------------------------------------------------------- |
| **API key**        | `sk-`  | Call inference endpoints (`/v1/chat/completions`, etc.). Billed against your deposit.         |
| **Management key** | `mk-`  | Administer your account: list / create / revoke API keys, read balance and usage. Not billed. |

Ship `sk-` keys to the runtime that actually calls models; use `mk-` keys for dashboards, audit integrations, and CI that needs to provision or rotate API keys.

Both kinds go in the `Authorization` header — same shape:

```
Authorization: Bearer sk-YOUR_API_KEY
```

```
Authorization: Bearer mk-YOUR_MANAGEMENT_KEY
```

No OAuth flow, no wallet signature per request, no session tokens. For the full request / response shape of every endpoint, see the **[Router API reference](https://0gfoundation.github.io/0g-router/)**.

## Permission matrix

One table covers what each credential can do and what scope it needs. `✅` = allowed, `❌` = `403 insufficient_scope`.

| Scenario                       | Endpoint                            | `sk-` API key | `mk-` Management key   |
| ------------------------------ | ----------------------------------- | :-----------: | :--------------------- |
| Run inference                  | `POST /v1/chat/completions` (etc.)  |       ✅      | ❌                      |
| Read balance / usage / history | `GET /v1/account/*`                 |       ❌      | ✅ `account:read`       |
| List API keys                  | `GET /v1/api-keys`                  |       ❌      | ✅ `keys:read`          |
| Create API key                 | `POST /v1/api-keys`                 |       ❌      | ✅ `keys:create`        |
| Edit / revoke API key          | `PATCH`/`DELETE /v1/api-keys/:id`   |       ❌      | ✅ `keys:manage`        |
| Manage management keys         | `ANY /v1/management-keys/*`         |       ❌      | ❌ — wallet JWT only    |

Two guardrails worth calling out:

- **Management keys cannot manage other management keys.** `*/v1/management-keys` requires the wallet JWT (sign-in session). A leaked `mk-` cannot mint replacements for itself.
- **`keys:manage` and `keys:create` are deliberately split.** A read-only audit integration that should be able to revoke a compromised key but **not** issue replacements gets `{keys:read, keys:manage}` and is locked out of issuance.

## API keys (`sk-`)

Created at **[pc.0g.ai](https://pc.0g.ai) → Dashboard → API Keys**. From there you can:

- **Create** a new key — label it so you can tell keys apart (e.g. `staging`, `agent-bot`, `my-laptop`). The full secret is shown **once** on creation; copy it immediately. The dashboard only stores a hash.
- **List** existing keys with their labels, created-at, and last-used timestamps.
- **Revoke** any key instantly — in-flight requests using a revoked key return `401 api_key_revoked` on their next call.

## Management keys (`mk-`)

Created at **[pc.0g.ai → Settings → Management Keys](https://pc.0g.ai)**. Each key carries an explicit allowlist of scopes — see the matrix above.

When creating a key, pick a preset or check scopes individually:

- **Read-only** — `account:read`, `keys:read`. Dashboards, monitoring.
- **Key Manager** — `keys:read`, `keys:manage`. Rotate / revoke existing keys, no issuance.
- **Full Admin** — all four scopes. CI that provisions per-deploy API keys.
- **Custom** — pick any subset.

**Audit fields.** Every successful request with an `mk-` key updates `last_used_at` and `last_source_ip` on the key. Writes are coalesced to at most one per key per 60 seconds. IPv4-mapped IPv6 addresses (`::ffff:1.2.3.4`) are normalized to dotted-quad so a dual-stack vs IPv4-only listener doesn't make one client look like two. (`sk-` keys don't record these — their audit signal is usage / billing.)

**Expiration.** Management keys do not expire. Rotate on a schedule by issuing a replacement and revoking the old key.

## Best practices

- **One key per deployment.** Separate staging / production / per-service keys so you can revoke one without touching the others.
- **Least privilege for `mk-`.** Don't grant `keys:create` to an integration that only needs to read. The preset selector is there for a reason.
- **Rotate on suspicion.** If a key might have leaked, revoke it and issue a new one — takes seconds.
- **Watch `last_used_at` on management keys.** A key that hasn't been used in months is a key you can probably revoke.

:::caution Never ship keys to browsers
Whoever has your `sk-` key can spend the 0G tokens you deposited; whoever has your `mk-` key can issue more `sk-` keys. Keep both server-side and proxy client requests through your own backend.
:::
