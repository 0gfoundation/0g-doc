---
id: trust-modes
title: Trust Modes & Private Inference
sidebar_label: Trust Modes
sidebar_position: 6
description: "Every Router request is verifiably routed to its intended provider. Private (TeeML) providers additionally keep your prompts and the inference process hidden from both 0G and the provider — opt in per request or per API key."
keywords: [trust mode, private inference, TeeML, TeeTLS, TEE, X-0G-Provider-Trust-Mode]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Trust Modes & Private Inference

Every request the Router serves is **verifiably routed** to its intended provider or channel — you get cryptographic proof that the response came from the model you asked for. On top of that, a subset of providers run the model itself inside a Trusted Execution Environment (TEE), so your prompts and the inference process stay hidden from everyone, including 0G. Those are **Private** providers.

This page explains the two provider types and how to guarantee your requests only ever hit a Private one.

## Provider types

Each provider declares one of two TEE [verification modes](../inference#verification-modes):

| Provider type | Guarantee | What it means for your data |
| ------------- | --------- | --------------------------- |
| **TeeML** (Private) | Model authenticity **and** inference privacy | The open-source model runs *inside* the TEE. Neither 0G nor the provider can see your prompts, completions, or the inference process. |
| **TeeTLS** | Model authenticity only | The request is verifiably routed over an attested TLS channel to a centralized provider (e.g. Alibaba Bailian, official MiniMax). The upstream provider still processes your data in the clear. |

In short: **every** request is verifiably routed to the intended provider or channel, but **only TeeML providers offer private inference**, where neither 0G nor the provider can see the data or process.

## Identifying provider types

On **[pc.0g.ai](https://pc.0g.ai)**:

- **Model list** — models served by a TeeML provider carry a **`Private`** tag.
- **Model detail page** — each provider shows its type as a **`TeeML`** or **`TeeTLS`** tag.

Programmatically, list the providers serving a model with `GET /v1/providers?model=…` — see [Models](./models#listing-providers-for-a-model). The response includes each provider's TEE attestation info.

## Is Private the default?

It depends on which providers serve the model:

- **Only TeeML providers** → Private is effectively the default; every request is private.
- **A mix of TeeML and TeeTLS providers** → the Router routes intelligently based on provider performance and load, so a request **may not** land on a Private provider unless you ask for one.

If privacy matters for your workload, don't rely on the default — pin trust mode explicitly using one of the options below.

## Routing only to Private (TeeML) providers

You can restrict provider selection to Private/TeeML providers per request or per API key.

### Option 1 — Per request header

Add the `X-0G-Provider-Trust-Mode: private` header to any inference request. Selection is then restricted to TeeML providers for that request.

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Trust-Mode: private" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

This is part of the `X-0G-Provider-*` routing header family — see [Provider Routing](./routing) for the full set.

### Option 2 — Per API key

Enable **`private` mode** on an API key and **all** requests made with that key will only use Private/TeeML providers — no per-request header needed.

**Path:** `Dashboard → API Key → ... → Edit`

This is the simplest way to enforce privacy across an entire application without changing your request code.

## When no Private provider is available

Private mode is a hard constraint, not a preference. If the requested model has **no** TeeML provider available, the request **fails with an error** rather than silently falling back to a non-private (TeeTLS) provider — so you never get a downgraded guarantee without knowing. See [Errors](./errors).

To check whether a model can serve private requests before sending traffic, look for the `Private` tag on [pc.0g.ai](https://pc.0g.ai) or inspect `GET /v1/providers?model=…`.

## Related

- [**Provider Routing**](./routing) — the full `X-0G-Provider-*` header family
- [**Verifiable Execution**](./features/verifiable-execution) — verify a provider's TEE signature on a response
- [**Verification modes**](../inference#verification-modes) — how TeeML and TeeTLS work under the hood
- [**Errors**](./errors) — status codes returned by the Router
