---
id: routing
title: Provider Routing
sidebar_position: 5
description: "Control which provider serves your request — by latency, price, or specific on-chain address — via X-0G-Provider-* request headers."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Provider Routing

By default, the Router sends each request to the cheapest healthy provider for the model and fails over automatically. `X-0G-Provider-*` request headers let you override this when you need specific behavior.

## Default Behavior

If you send no routing headers, the Router:

1. Picks the cheapest healthy provider for the requested model. Providers that tie on price are told apart by recent health and latency; requests to providers that still tie are spread among them (or kept on one per [conversation](#conversation-affinity)).
2. If that provider fails or answers `429`, retries on the next-best provider, up to 4 attempts in total. A retry skips the upstream that just rejected the request, even when another provider address serves the same upstream.
3. Returns the response — or, if every attempt failed, the error from the last attempt.

This is the recommended path for most applications.

## Conversation affinity

A prompt cache lives with the provider that wrote it. To keep your cache hits, the Router sends every turn of a conversation to the same provider, as long as that provider stays healthy and is still among the best-ranked for the request. This applies to `/v1/chat/completions` and `/v1/messages`.

The Router identifies a conversation by the first of these it finds:

1. The `X-Session-Id` header.
2. The `X-Claude-Code-Session-Id` header, which [Claude Code](./clients/claude-code) sends on its own.
3. `prompt_cache_key` in the request body.
4. The opening of the conversation: the system prompt and the first message after it. Agent loops resend these unchanged on every turn, so most clients need no changes.

Send your own `X-Session-Id` when the opening of a conversation changes between turns (for example, the system prompt includes the current time), or when two conversations start identically and you want them kept apart. Use the same value for every turn of a conversation; a new value starts a new conversation.

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-Session-Id: support-ticket-4812" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Affinity only chooses among providers that rank equally for your request. It never overrides `X-0G-Provider-Sort`, a price cap, or a pinned address. If the provider fails, that request is retried on another provider as usual (unless you pin an address without allowing fallbacks), and the retry starts with a cold cache. Later turns go back to the original provider once it is serving again.

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
    "model": "glm-5.2",
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
    "model": "glm-5.2",
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
    "model": "glm-5.2",
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
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Routes directly to a specific provider by on-chain address. **Fallback is disabled by default when pinning by address** — if the pinned provider fails, the request fails. Add `X-0G-Provider-Allow-Fallbacks: true` to retry a failed request; retries stay on the pinned address.

One provider address can serve a model through several upstream channels (see the **Pin an Upstream** tab). If you pin only the address and the upstream that would serve you has just answered `429`, the Router picks another upstream under the same address when one is available. That upstream is a separate listing and may differ in price (you pay the rate of the upstream that served you), context length and supported parameters; a price ceiling you set still applies. Add `X-0G-Provider-Identity` to pin one upstream exactly.

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
  "model": "glm-5.2",
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
| `X-0G-Provider-Sort`            | `latency` \| `price`                | Sort strategy when no address is pinned. Default: `price`. Ignored if `X-0G-Provider-Address` is set. Must be exactly `latency` or `price` — any other non-empty value is rejected with `400 invalid_provider_header`. |
| `X-0G-Provider-Trust-Mode`      | `standard` \| `verified` \| `private` | Restrict provider selection to a trust tier — see [Trust modes](#trust-modes).                                |
| `X-0G-Provider-Allow-Fallbacks` | `true` \| `false`                   | Retry a failed request on another provider (with a pinned address, on the same address). Must be exactly `true` or `false` (case-insensitive) — `1`, `0`, `yes`, and other non-empty values are rejected with `400 invalid_provider_header`. |
| `X-0G-Provider-Max-Price-Usd-Prompt`     | finite, non-negative decimal | Per-request ceiling on prompt token price, USD per 1M tokens. See [Capping price per request](#capping-price-per-request). |
| `X-0G-Provider-Max-Price-Usd-Completion` | finite, non-negative decimal | Per-request ceiling on completion token price, USD per 1M tokens. See [Capping price per request](#capping-price-per-request). |
| `X-0G-Provider-Max-Price-Usd-Image`      | finite, non-negative decimal | Per-request ceiling on image price, USD per generated image. See [Capping price per request](#capping-price-per-request). |
| `X-0G-Provider-Require-Parameters` | `true` \| `false`              | Route only to providers that support every sampling and reasoning parameter in the request. Default `false`. See [Requiring parameter support](#requiring-parameter-support). Same value rules as `Allow-Fallbacks`. |
| `X-Session-Id`                  | any string, stable per conversation | Keep every turn of a conversation on the same provider. Optional — see [Conversation affinity](#conversation-affinity). |

Defaults: `Require-Parameters` is `false`. `Allow-Fallbacks` is `true` normally, and `false` when `X-0G-Provider-Address` is set.

A header that is absent, or blank after trimming whitespace, is treated as unset and falls back to the default. Only a **present-but-malformed** value is rejected — a blank header meaning "I didn't set this" is never an error.

### Trust modes

`X-0G-Provider-Trust-Mode` restricts selection by the provider's [verification mode](../inference#verification-modes). The tiers are ordered `standard < verified < private` and act as a floor: asking for `verified` is also satisfied by the stronger `private`.

| Value      | Routes to                      | Guarantee                                                                                          |
| ---------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `standard` | All providers, including third-party channels | Full model access. Non-verifiable: no attestation or signed proof to check.                        |
| `verified` | TeeML **and** TeeTLS providers | Verifiable execution — the response provably came from the real model.                              |
| `private`  | TeeML providers only           | Verifiability **and** privacy — the model itself runs inside the TEE, so prompts never leave the enclave. |

Values other than `standard`/`verified`/`private` are rejected with `400 invalid_trust_mode`. Omit the header for no trust-tier restriction (the default) — an unrestricted request can be served by any provider of the model, including `standard` ones.

### Requiring parameter support

On `/v1/chat/completions` and `/v1/messages`, a request that uses `tools` or `response_format` only ever goes to providers that support them.

For `frequency_penalty`, `presence_penalty`, `seed`, `tool_choice` and `reasoning_effort` the default is a preference: the Router prefers providers that list the parameter in `supported_parameters` (even over a cheaper or faster one), and otherwise uses a provider that ignores it. The request never fails for lack of support.

Send `X-0G-Provider-Require-Parameters: true` to make this a hard requirement:

- If no provider supports every such parameter in the request, it fails with `400 model_not_capable`.
- If the request sets `max_tokens` or `max_completion_tokens`, only providers that report a `max_completion_tokens` at least that large qualify. Providers that report none are excluded. If none qualifies, the request fails with `400 no_provider_within_max_tokens`.

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Require-Parameters: true" \
  -d '{
    "model": "glm-5.2",
    "seed": 42,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

A pinned `X-0G-Provider-Address` skips both the preference and the requirement.

## Capping price per request

The `X-0G-Provider-Max-Price-Usd-*` headers set a **hard ceiling** on what you're willing to pay. Any provider above the ceiling on a relevant dimension is dropped from the candidate pool entirely — this is a filter, not a preference, and it runs **before** sorting and failover. A fallback during an outage can never silently route you to a provider you've priced out.

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Max-Price-Usd-Prompt: 1.0" \
  -H "X-0G-Provider-Max-Price-Usd-Completion: 5.0" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Send any subset — one header, two, or all three. Each value is a finite, non-negative decimal; `NaN`, `Inf`, negative, and non-numeric values are rejected with `400 invalid_max_price_usd`. A value of `0` sets no ceiling.

### Which dimension applies to which endpoint

The ceiling is **service-type aware**. Setting `Image` on a chat call (or `Prompt` / `Completion` on an image call) is silently inert, so a cross-endpoint SDK that always sends all three headers won't accidentally filter out every provider.

| Service type            | Endpoints                                                    | Dimensions enforced     | Unit                   |
| ----------------------- | ----------------------------------------------------------- | ----------------------- | ---------------------- |
| Chat                    | `/v1/chat/completions`, `/v1/messages`                      | `Prompt`, `Completion`  | USD per 1M tokens      |
| Embeddings              | `/v1/embeddings`                                            | `Prompt`                | USD per 1M input tokens |
| Decisions               | `/v1/decisions`                                             | `Prompt`                | USD per 1M input tokens |
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
