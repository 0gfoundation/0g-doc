---
id: rate-limits
title: Rate Limits
sidebar_position: 9
description: "How the Router throttles requests, what headers you'll see, and how to handle 429 responses."
---

# Rate Limits

The Router applies per-account request limits to keep the network responsive. The exact thresholds depend on your account state and may evolve as we tune them — this page documents how to **observe and react to** the limit, not the specific numbers.

## Response headers

Every inference response includes rate-limit headers (OpenAI-compatible) so you can back off proactively without waiting for a `429`:

```http
X-RateLimit-Limit-Requests: <your current per-minute limit>
X-RateLimit-Remaining-Requests: <how many you have left in this window>
X-RateLimit-Reset-Requests: <ISO-8601 timestamp when the window resets>
```

## 429 Too Many Requests

When you exceed the limit, the Router returns `429` immediately with a `Retry-After` header (seconds):

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 15
Content-Type: application/json
```

```json
{
  "error": {
    "message": "Rate limit exceeded. Please try again later.",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}
```

**Honor `Retry-After`.** Don't retry in a tight loop — the Router will keep returning `429` and your real requests will be delayed.

## Related

- [**Errors**](./errors)
- [**Deposits & Billing**](./account/deposits)

:::info Coming soon
Per-API-key throughput controls — explicit **RPM** (requests per minute) and **TPM** (tokens per minute) budgets settable in the dashboard — are on the roadmap.
:::
