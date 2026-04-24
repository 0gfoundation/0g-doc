---
id: rate-limits
title: Rate Limits
sidebar_position: 9
description: "How the Router throttles requests under load, what you see on the wire, and how to handle 429 responses."
---

# Rate Limits

The Router dynamically throttles requests based on current network load. When demand spikes or a particular model's providers are saturated, you may be rate limited for a short period.

## What you'll see

When the Router accepts your request but cannot yet dispatch it to a provider, the HTTP connection stays open and you'll keep receiving keep-alive traffic until the request goes through or times out:

- **Non-streaming requests** — the server periodically sends empty lines while waiting
- **Streaming (SSE) requests** — the server sends SSE keep-alive comments (`: keep-alive`) every few seconds

Neither affects JSON body parsing. Standard OpenAI client libraries and `curl` handle both correctly out of the box. If you're parsing the HTTP response yourself, skip empty lines / comment frames that arrive before the real payload.

If the Router cannot serve your request within **10 minutes**, it closes the connection.

## 429 Too Many Requests

When the Router decides to reject rather than wait, it returns `429 Too Many Requests` with a `Retry-After` header (seconds):

```
HTTP/1.1 429 Too Many Requests
Retry-After: 15
Content-Type: application/json
```

```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "code": "too_many_requests"
  }
}
```

**Honor `Retry-After`.** Don't retry in a tight loop — the Router will keep returning `429` and your real requests will be delayed.

## Related

- [**Errors**](./errors)
- [**Deposits & Billing**](./account/deposits)

:::info Coming soon
Per-API-key throughput controls — explicit **RPM** (requests per minute) and **TPM** (tokens per minute) budgets set in the dashboard — are on the roadmap. Today throttling is purely load-adaptive.
:::
