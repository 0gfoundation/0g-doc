---
id: errors
title: Errors
sidebar_position: 10
description: "HTTP status codes and error shapes returned by the Router."
---

# Errors

Errors follow a consistent OpenAI-compatible shape. The response also includes `request_id` at the top level when available — quote it when reporting issues.

```json
{
  "error": {
    "message": "Insufficient balance to process request",
    "type": "payment_error",
    "code": "insufficient_balance"
  },
  "request_id": "req_abc123"
}
```

## HTTP Status Codes

| Status | Meaning                                                                         |
| ------ | ------------------------------------------------------------------------------- |
| `400`  | Bad request — invalid model, malformed body, unsupported feature for model      |
| `401`  | Missing or invalid authentication                                               |
| `402`  | Insufficient balance — [deposit more](./account/deposits)                       |
| `403`  | The API key does not have permission to perform this action                     |
| `404`  | Resource not found                                                              |
| `429`  | Rate limited — check `Retry-After` header, see [Rate Limits](./rate-limits)     |
| `502`  | Provider returned an error (failover exhausted)                                 |
| `503`  | No healthy providers available for the requested model                          |

## Error Types and Codes

`error.type` groups errors into a small set of buckets; `error.code` identifies the specific cause.

| `type`                  | `code` (examples)                                            | When it happens                                      |
| ----------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `invalid_request_error` | `invalid_body`, `missing_authorization`, `invalid_api_key`, `api_key_revoked` | 400, 401 — request or auth is wrong |
| `payment_error`         | `insufficient_balance`                                       | 402 — not enough 0G deposited                        |
| `permission_error`      | `access_denied`                                              | 403 — the key is not allowed to perform this action  |
| `not_found_error`       | `api_key_not_found`                                          | 404 — resource doesn't exist                         |
| `rate_limit_error`      | `rate_limit_exceeded`                                        | 429 — see [Rate Limits](./rate-limits)               |
| `server_error`          | `no_available_provider`, `provider_error`, `internal_error`  | 502, 503, 500 — backend problem                      |

## Retrying

- `429` — honor `Retry-After`, then retry
- `502` (`provider_error`) — the Router already tried every healthy provider; retrying may help if one just came back online
- `503` (`no_available_provider`) — unlikely to resolve in seconds; consider a different model or waiting

Do **not** retry `400`, `401`, `402`, or `403` without changing your request — they won't succeed.

## Related

- [**Rate Limits**](./rate-limits)
- [**Deposits & Billing**](./account/deposits)
