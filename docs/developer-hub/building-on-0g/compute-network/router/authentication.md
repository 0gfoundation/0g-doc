---
id: authentication
title: Authentication
sidebar_position: 6
description: "API keys are how you authenticate with the 0G Compute Router. Inference keys (sk-) call models; management keys (mk-) administer your account."
---

# Authentication

The Router authenticates every request with an **API key**. Each key is tied to your wallet address; inference usage is billed against the 0G tokens you deposited to the [Payment Layer](./account/deposits).

There are **two kinds of keys**, with different prefixes and different powers:

| Key type             | Prefix | What it can do                                                                                     |
| -------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| **Inference key**    | `sk-`  | Call inference endpoints (`/v1/chat/completions`, etc.). Billed against your deposit.              |
| **Management key**   | `mk-`  | Administer your account: list / create / revoke inference keys, read balance and usage. Not billed. |

Pick the right one for the job: ship `sk-` keys to the runtime that actually calls models; use `mk-` keys for dashboards, audit integrations, and CI that needs to provision or rotate inference keys.

## Sending the key

Send the key in the `Authorization` header on every request — same shape for both kinds:

```
Authorization: Bearer sk-YOUR_API_KEY
```

```
Authorization: Bearer mk-YOUR_API_KEY
```

That's the whole protocol — no OAuth flow, no wallet signature per request, no session tokens.

## Inference keys (`sk-`)

Inference keys are what your application servers carry. Each call to `/v1/chat/completions` (and the other inference endpoints) is billed against the depositing wallet's balance.

Create and manage them in the Web UI: **[pc.0g.ai](https://pc.0g.ai) → Dashboard → API Keys**. From there you can:

- **Create** a new key — label it so you can tell keys apart (e.g. `staging`, `agent-bot`, `my-laptop`). The full secret is shown **once** on creation; copy it immediately. The dashboard only stores a hash.
- **List** existing keys with their labels, created-at, and last-used timestamps.
- **Revoke** any key instantly — in-flight requests using a revoked key return `401 api_key_revoked` on their next call.

Inference keys can only call inference endpoints. They **cannot** read `/v1/account/*` (balance, usage, history) and they **cannot** manage other keys — those calls return `403 insufficient_scope`. Use a management key (or your wallet JWT) for that.

## Management keys (`mk-`)

Management keys are scope-based admin credentials. Instead of a single permission level, each key carries an explicit allowlist of scopes — grant only what the integration needs.

### Scopes

| Scope            | Grants                                                            | Risk     |
| ---------------- | ----------------------------------------------------------------- | -------- |
| `account:read`   | Read balance, usage, and history (`GET /v1/account/*`)            | Low      |
| `keys:read`      | List inference keys (`GET /v1/api-keys`)                          | Low      |
| `keys:manage`    | Edit or revoke existing inference keys (`PATCH`/`DELETE`)         | **High** |
| `keys:create`    | Issue new inference keys (`POST /v1/api-keys`)                    | **High** |

The split between `keys:manage` and `keys:create` is deliberate. A read-only audit integration that should be able to revoke a compromised key but **not** issue replacements gets `{keys:read, keys:manage}` and is locked out of issuance.

### Presets

The Web UI offers four presets when you create a management key — pick one or check scopes individually:

- **Read-only** — `account:read`, `keys:read`. Dashboards, monitoring.
- **Key Manager** — `keys:read`, `keys:manage`. Rotate / revoke existing keys, no issuance.
- **Full Admin** — all four scopes. CI that provisions per-deploy inference keys.
- **Custom** — pick any subset.

### Create and manage

Management keys are created at **[pc.0g.ai](https://pc.0g.ai) → Settings → Management Keys**.

- **Create** — name the key, pick scopes (or a preset). The full `mk-…` secret is shown **once**; copy it immediately.
- **Inspect** — click a row to expand the detail panel: key prefix, created-at, last-used-at, last source IP, and the full permission matrix.
- **Edit** — rename or change scopes in place. Only changed fields are sent on the wire.
- **Revoke** — instant. The next call with that key returns `401`.

### What you can hit with `mk-`

| Endpoint                              | Required scope                  |
| ------------------------------------- | ------------------------------- |
| `GET /v1/account/*`                   | `account:read`                  |
| `GET /v1/api-keys`                    | `keys:read`                     |
| `POST /v1/api-keys`                   | `keys:create`                   |
| `PATCH /v1/api-keys/:id`              | `keys:manage`                   |
| `DELETE /v1/api-keys/:id`             | `keys:manage`                   |
| `POST /v1/chat/completions` (etc.)    | — **denied**, use an `sk-` key  |
| `*/v1/management-keys`                | — **denied**, use the wallet JWT |

Two guardrails worth calling out:

- **Management keys cannot manage other management keys.** All four `*/v1/management-keys` endpoints require the wallet JWT (sign-in session). This blocks privilege escalation — a leaked `mk-` cannot mint replacements for itself.
- **Management keys cannot call inference.** They return `403` on `/v1/chat/completions` and friends. Mixing audit credentials with billed traffic was never the intent.

### Audit fields

Every successful request with an `mk-` key updates **`last_used_at`** and **`last_source_ip`** on the key. Writes are coalesced to at most one per key per 60 seconds, so a polling integration doesn't generate a write per request. IPv4-mapped IPv6 addresses (`::ffff:1.2.3.4`) are normalized to dotted-quad before storage so a dual-stack vs IPv4-only listener doesn't make one client look like two.

Inference keys do **not** record these fields — for `sk-` keys the audit signal is usage / billing.

### Expiration

Management keys do not expire and the HTTP surface does not accept an expiration. Rotate them on a schedule by issuing a replacement and revoking the old key.

## Picking the right credential

| You want to…                                            | Use                                       |
| ------------------------------------------------------- | ----------------------------------------- |
| Call `/v1/chat/completions` from your backend           | `sk-` inference key                       |
| Read balance / usage from a monitoring job              | `mk-` with `account:read`                 |
| Auto-provision per-tenant inference keys from CI        | `mk-` with `keys:create` (+ `keys:read`)  |
| Auto-revoke leaked keys from a security-monitoring job  | `mk-` with `keys:read` + `keys:manage`    |
| Manage management keys themselves                       | Wallet sign-in (JWT) at pc.0g.ai          |

## Best practices

- **One key per deployment.** Separate staging / production / per-service keys so you can revoke one without touching the others.
- **Least privilege for `mk-`.** Don't grant `keys:create` to an integration that only needs to read. The preset selector is there for a reason.
- **Rotate on suspicion.** If a key might have leaked, revoke it and issue a new one — takes seconds.
- **Watch `last_used_at` on management keys.** A key that hasn't been used in months is a key you can probably revoke.

:::caution Never ship API keys to browsers
Whoever has your inference key can spend the 0G tokens you deposited; whoever has your management key can issue more inference keys. Keep both server-side and proxy client requests through your own backend — your backend holds the key, your frontend talks to your backend.
:::
