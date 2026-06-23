---
id: routing
title: Provider Routing
sidebar_position: 5
description: "Control which provider serves your request — by latency, price, or specific on-chain address — via X-0G-Provider-* request headers."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Provider Routing

By default, the Router distributes requests across healthy providers using round-robin with automatic failover. `X-0G-Provider-*` request headers let you override this when you need specific behavior.

## Default Behavior

If you send no routing headers, the Router:

1. Picks a healthy provider for the requested model
2. Retries on the next healthy provider if the first returns an error
3. Returns the response — or a `503` if every provider failed

This is the recommended path for most applications.

## Routing surfaces

The Router accepts routing preferences from two surfaces. In priority order:

| Priority | Surface | Endpoints | Status |
| -------- | ------- | --------- | ------ |
| 1 | `X-0G-Provider-*` request headers | All inference endpoints (JSON, multipart, async) | **Canonical** |
| 2 | JSON body `provider: {…}` object | JSON endpoints only (`/v1/chat/completions`, `/v1/messages`, `/v1/images/generations`, `/v1/async/images/generations`) | Deprecated — kept for back-compat |

Headers and body are merged field-by-field; when the same field is set on both, the header wins. Multipart endpoints (`/v1/audio/transcriptions`, `/v1/images/edits`, `/v1/async/images/edits`) have **no body routing surface** — headers are the only way to control routing there.

:::caution The JSON body `provider` object is deprecated
New code should use `X-0G-Provider-*` headers. The body surface still works today for back-compat but will be phased out in a future release. Headers are the only routing surface that works uniformly across JSON, multipart, and async endpoints.
:::

## Routing Strategies

<Tabs>
<TabItem value="latency" label="Lowest Latency" default>

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Sort: latency" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Routes to the provider with the lowest recently-observed latency for this model.

</TabItem>
<TabItem value="price" label="Lowest Price">

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Sort: price" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Routes to the cheapest provider currently serving this model.

</TabItem>
<TabItem value="address" label="Pin a Specific Provider">

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Address: 0xd9966e..." \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Routes directly to a specific provider by on-chain address. **Fallback is disabled by default when pinning** — if the pinned provider fails, the request fails. Add `X-0G-Provider-Allow-Fallbacks: true` to re-enable cross-provider retry.

</TabItem>
<TabItem value="multipart" label="Multipart (audio / image edit)">

Multipart endpoints accept the same headers — this is the only routing surface available there.

```bash
curl https://router-api.0g.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Sort: latency" \
  -F "file=@recording.mp3" \
  -F "model=openai/whisper-large-v3"
```

</TabItem>
<TabItem value="json-body" label="JSON body (deprecated)">

The legacy JSON body surface still works on JSON endpoints. New code should prefer headers.

```json
{
  "model": "zai-org/GLM-5-FP8",
  "messages": [{"role": "user", "content": "Hello"}],
  "provider": {
    "sort": "latency"
  }
}
```

When both surfaces are present and set the same field, the header wins.

</TabItem>
</Tabs>

## Header Reference

HTTP header names are case-insensitive per RFC 7230 — `X-0G-Provider-Address` and `x-0g-provider-address` are equivalent.

| Header                          | Values                              | Description                                                                                                  |
| ------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `X-0G-Provider-Address`         | on-chain address (`0x…`)            | Pin the request to a specific provider. Implies `Allow-Fallbacks: false` unless overridden.                  |
| `X-0G-Provider-Sort`            | `latency` \| `price`                | Sort strategy when no address is pinned. Ignored if `X-0G-Provider-Address` is set.                          |
| `X-0G-Provider-Trust-Mode`      | `private`                           | Restrict selection to Private (TeeML) providers — see [Trust Modes](./trust-modes).                          |
| `X-0G-Provider-Allow-Fallbacks` | `true` \| `false`                   | Allow cross-provider retry on failure. Lenient: anything other than `true`/`false` is treated as unset and defers to the default. |

Defaults: `Allow-Fallbacks` is `true` normally, and `false` when `X-0G-Provider-Address` is set.

### Trust modes

`X-0G-Provider-Trust-Mode: private` restricts selection to **Private (TeeML)** providers — those that run the model inside a TEE, so prompts never leave the enclave. Omit the header for no trust-tier restriction (the default). See [**Trust Modes**](./trust-modes) for the full explanation, including how to enforce private mode per API key.

## Discovering Provider Addresses

List the providers serving a model with `GET /v1/providers?model_id=…` — see [Models](./models#listing-providers-for-a-model).

## Related

- [**Principles**](./principles) — why failover is the default
- [**Errors**](./errors) — what `502` and `503` mean for routing
