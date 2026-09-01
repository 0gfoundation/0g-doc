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
<TabItem value="max-price" label="Cap Price">

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Max-Price-Usd-Prompt: 1.0" \
  -H "X-0G-Provider-Max-Price-Usd-Completion: 5.0" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Drops every provider above the ceiling **before** sorting and failover, so even a fallback during an outage can't route you to a more expensive provider. See [Capping price per request](#capping-price-per-request).

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

Routes directly to a specific provider by on-chain address. **Fallback is disabled by default when pinning by address** — if the pinned provider fails, the request fails. Add `X-0G-Provider-Allow-Fallbacks: true` to re-enable cross-provider retry.

</TabItem>
<TabItem value="identity" label="Pin an Upstream (identity)">

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Identity: aliyun" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Some models are served through more than one upstream channel. `provider_identity` is the operator-declared name of that channel (for example `aliyun`, `zhipu`, `openrouter`) — a routing label, not an attested property (`verifiability` remains the trust signal). It is shown per endpoint on [`GET /v1/providers`](./models#listing-providers-for-a-model) and matched verbatim (case-sensitive). The header works in two modes:

- **Alone** — a filter, not a pin: it narrows the candidates for the model to every endpoint carrying that identity, possibly across several providers, then the normal ranking (your [`X-0G-Provider-Sort`](#header-reference) choice) picks among them. Fallback stays enabled but only across the matching endpoints — it never spills over to other identities.
- **Combined with `X-0G-Provider-Address`** — pins the exact upstream variant under that provider address, and inherits the address pin's `Allow-Fallbacks: false` default.

An identity that matches no endpoint fails deterministically, rejected with `400 provider_model_mismatch` — never a silent fallback to unfiltered routing. Other routing filters compose after the identity filter: if the identity's endpoints exist but none matches a requested [trust mode](#trust-modes), the request fails with `503 no_provider_for_trust_mode` instead. Endpoints that serve a model through a single native channel carry no identity (the field is omitted on `/v1/providers`); pin those by address.

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
| `X-0G-Provider-Identity`        | upstream channel name (e.g. `aliyun`) | Route to a named upstream channel. Alone it filters candidates to that identity and normal ranking picks among them; with `X-0G-Provider-Address` it pins the exact variant and inherits `Allow-Fallbacks: false`. An identity matching no endpoint is rejected with `400 provider_model_mismatch`. |
| `X-0G-Provider-Sort`            | `latency` \| `price`                | Sort strategy when no address is pinned. Ignored if `X-0G-Provider-Address` is set. Must be exactly `latency` or `price` — any other non-empty value is rejected with `400 invalid_provider_header`. |
| `X-0G-Provider-Trust-Mode`      | `standard` \| `verified` \| `private` | Restrict provider selection to a trust tier — see [Trust modes](#trust-modes).                                |
| `X-0G-Provider-Allow-Fallbacks` | `true` \| `false`                   | Allow cross-provider retry on failure. Must be exactly `true` or `false` (case-insensitive) — `1`, `0`, `yes`, and other non-empty values are rejected with `400 invalid_provider_header`. |
| `X-0G-Provider-Max-Price-Usd-Prompt`     | finite, non-negative decimal | Per-request ceiling on prompt token price, USD per 1M tokens. See [Capping price per request](#capping-price-per-request). |
| `X-0G-Provider-Max-Price-Usd-Completion` | finite, non-negative decimal | Per-request ceiling on completion token price, USD per 1M tokens. See [Capping price per request](#capping-price-per-request). |
| `X-0G-Provider-Max-Price-Usd-Image`      | finite, non-negative decimal | Per-request ceiling on image price, USD per generated image. See [Capping price per request](#capping-price-per-request). |

Defaults: `Allow-Fallbacks` is `true` normally, and `false` when `X-0G-Provider-Address` is set.

A header that is absent, or blank after trimming whitespace, is treated as unset and falls back to the default. Only a **present-but-malformed** value is rejected — a blank header meaning "I didn't set this" is never an error.

### Trust modes

`X-0G-Provider-Trust-Mode` restricts selection by the provider's [verification mode](../inference#verification-modes). The tiers are ordered `standard < verified < private` and act as a floor: asking for `verified` is also satisfied by the stronger `private`.

| Value      | Routes to                      | Guarantee                                                                                          |
| ---------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `standard` | All providers, including third-party channels | Full model access. Non-verifiable: no attestation or signed proof to check.                        |
| `verified` | TeeML **and** TeeTLS providers | Verifiable execution — the response provably came from the real model.                              |
| `private`  | TeeML providers only           | Verifiability **and** privacy — the model itself runs inside the TEE, so prompts never leave the enclave. |

Values other than `standard`/`verified`/`private` are rejected with `400 invalid_trust_mode`. Omit the header for no trust-tier restriction (the default) — an unrestricted request can be served by any provider of the model, including `standard` ones.

## Capping price per request

The `X-0G-Provider-Max-Price-Usd-*` headers set a **hard ceiling** on what you're willing to pay. Any provider above the ceiling on a relevant dimension is dropped from the candidate pool entirely — this is a filter, not a preference, and it runs **before** sorting and failover. A fallback during an outage can never silently route you to a provider you've priced out.

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Max-Price-Usd-Prompt: 1.0" \
  -H "X-0G-Provider-Max-Price-Usd-Completion: 5.0" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Send any subset — one header, two, or all three. Each value is a finite, non-negative decimal; `NaN`, `Inf`, negative, and non-numeric values are rejected with `400 invalid_max_price_usd`.

### Which dimension applies to which endpoint

The ceiling is **service-type aware**. Setting `Image` on a chat call (or `Prompt` / `Completion` on an image call) is silently inert, so a cross-endpoint SDK that always sends all three headers won't accidentally filter out every provider.

| Service type            | Endpoints                                                    | Dimensions enforced     | Unit                   |
| ----------------------- | ----------------------------------------------------------- | ----------------------- | ---------------------- |
| Chat                    | `/v1/chat/completions`, `/v1/messages`                      | `Prompt`, `Completion`  | USD per 1M tokens      |
| Image                   | `/v1/images/generations`, `/v1/images/edits`, `/v1/async/images/*` | `Image`          | USD per generated image |
| Speech-to-text          | `/v1/audio/transcriptions`                                  | none yet — see below    | —                      |

:::note Speech-to-text is not covered yet
STT models are billed per second of audio, which has no equivalent in the current USD pricing schema (`prompt` / `completion` / `image` only). Reusing the `Prompt` header for STT would be a footgun — the same `1.0` would mean "$1 per 1M tokens" on chat and "$1 per second" on audio — so `/v1/audio/transcriptions` enforces no ceiling for now.
:::

Two failure modes are worth calling out:

- **No provider qualifies.** If the ceiling filters out every candidate, the request fails with `400 no_provider_within_max_price`, not `503` — the pool is empty structurally, not transiently, so retrying without raising the ceiling won't help.
- **Pinning + ceiling.** If `X-0G-Provider-Address` pins a provider above the ceiling, the request fails with `400 pinned_provider_exceeds_max_price` — the pin isn't silently overridden.

## Discovering Provider Addresses

List the providers serving a model with `GET /v1/providers?model_id=…` — see [Models](./models#listing-providers-for-a-model).

## Related

- [**Principles**](./principles) — why failover is the default
- [**Errors**](./errors) — what `502` and `503` mean for routing
