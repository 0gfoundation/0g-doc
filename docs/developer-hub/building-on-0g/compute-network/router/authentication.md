---
id: authentication
title: Authentication
sidebar_position: 6
description: "API keys are how you authenticate with the 0G Compute Router. Create them in the Web UI; send them in the Authorization header."
---

# Authentication

The Router authenticates every request with an **API Key**. Each key is tied to your wallet address; usage is billed against the 0G tokens you deposited to the [Payment Layer](./account/deposits).

## Sending the key

Send the key in the `Authorization` header on every request:

```
Authorization: Bearer sk-YOUR_API_KEY
```

That's the whole protocol — no OAuth flow, no wallet signature per request, no session tokens.

## Create and manage keys

API keys are created and managed in the Web UI: **[pc.0g.ai](https://pc.0g.ai) → Dashboard → API Keys**. From there you can:

- **Create** a new key — label it so you can tell keys apart (e.g. `staging`, `agent-bot`, `my-laptop`). The full secret is shown **once** on creation; copy it immediately. The dashboard only stores a hash.
- **List** existing keys with their labels, created-at, and last-used timestamps.
- **Revoke** any key instantly — in-flight requests using a revoked key return `401 api_key_revoked` on their next call.

## Best practices

- **One key per deployment.** Separate staging / production / per-service keys so you can revoke one without touching the others.
- **Rotate on suspicion.** If a key might have leaked, revoke it and issue a new one — takes seconds.

:::caution Never ship API keys to browsers
Whoever has your key can spend the 0G tokens you deposited. Keep keys server-side and proxy client requests through your own backend — your backend holds the key, your frontend talks to your backend.
:::

:::info Coming soon
Per-key controls such as **permission scopes**, **expiration**, and **per-key rate / token limits** are on the roadmap. Today every key grants full inference access and does not expire.
:::
