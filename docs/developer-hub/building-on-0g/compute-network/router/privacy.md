---
id: privacy
title: Data Privacy & Zero Data Retention
sidebar_label: Privacy & ZDR
sidebar_position: 7
description: "What the 0G Compute Router retains, what it never sees, and how to enforce sealed (TeeML-only) inference per API key or per request."
---

# Data Privacy & Zero Data Retention

This page describes exactly what happens to your data on the 0G Compute Router (pc.0g.ai): what is retained, what is never stored, and how to restrict routing to sealed-inference providers.

## Zero data retention

The Router operates with zero data retention on inference content:

- **Prompts and completions are processed in memory only** for the lifetime of the request: the Router handles them in memory to route and bill the request, and never writes them to storage. There is no conversation table and no response archive; billing records carry metadata only.
- **0G does not train on your data.** Content that is never stored cannot be used for training.
- **Multipart inputs are not stored.** Audio and image inputs sent to multipart endpoints are passed through in memory for the lifetime of the request and never persisted. The Router does not store generated images: results are returned to the caller and not kept.

### What is retained

Billing and usage metadata only:

| Field | Purpose |
|-------|---------|
| Request ID | Support and audit lookups |
| Wallet address | Account attribution |
| Model and provider | Per-model usage breakdowns |
| Token counts (input / output / cached) | Billing |
| Trust tier served | Per-tier audit (see below) |
| Cost and timestamp | Billing and statements |

None of these fields contain request content.

## Privacy mode

In privacy mode, requests route **only to TeeML providers**: the model itself runs inside a Trusted Execution Environment (Intel TDX with TEE-enabled GPUs). The prompt enters the enclave encrypted, the response is signed inside the enclave, and the host machine sees only encrypted traffic. Neither 0G nor the provider operating the hardware can see the inference data or process. Every enclave publishes a hardware attestation verifiable with [dstack](https://github.com/Dstack-TEE/dstack).

This is the `private` tier of [trust-mode routing](./routing.md#trust-modes):

| Tier | Routes to | Guarantee |
|------|-----------|-----------|
| `private` | TeeML providers only | Sealed inference: prompts never leave the enclave |
| `verified` | TeeML and TeeTLS providers | Verifiable execution: the response provably came from the real model |
| `standard` | All providers, including third-party channels | Full model access. Non-verifiable: no attestation or signed proof to check |

With TeeTLS, 0G's broker (itself running inside a TEE) relays your request over attested TLS and cannot read it in transit, but the upstream provider processes your prompt under its own data policy. `standard` places no restriction on the provider pool: it widens the catalog to third-party channels that are non-verifiable. The serving broker runs on TEE hardware with verification disabled and the upstream is not disclosed, so there is no attestation or signature to check on the response. Today the Claude and GPT-5.6 families are served on this tier; the live list is always the [models endpoint](#models-with-privacy-mode). If your requirement is that no third party ever sees plaintext, use `private`.

:::note Model selection is not tier selection
A request that does not set a trust mode can be served by **any** provider of the model, including `standard` ones, and the model list displays each model according to its **highest-capability** provider. When a model has multiple providers, the Router balances between them for performance. To guarantee a verifiable channel, pin the tier explicitly using one of the methods below.
:::

For workloads that must not touch the Router at all, [Advanced mode](https://pc.0g.ai/sdk) connects your wallet directly to a provider: funding and inference happen entirely inside the decentralized network, with no intermediary in the path.

## Enabling privacy mode

**Per API key** — in [pc.0g.ai](https://pc.0g.ai) open Dashboard → API Keys and set the key's trust mode to Private. Every request made with that key routes only to TeeML providers, regardless of what the calling code sends. Programmatically: `POST /v1/api-keys` with `"trust_mode": "private"` (requires an `mk-` management key, see [Authentication](./authentication.md)).

**Per request** — send the routing header:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://router-api.0g.ai/v1",
    api_key="sk-YOUR_API_KEY",
    default_headers={"X-0G-Provider-Trust-Mode": "private"},
)

completion = client.chat.completions.create(
    model="glm-5.2",  # served by a TeeML provider
    messages=[{"role": "user", "content": "Hello"}],
)
```

If no TeeML provider is available for the requested model, the request fails with a `503` and never silently falls back to a lower tier:

```json
{
  "error": {
    "message": "no provider available for trust mode: tier=private",
    "type": "server_error",
    "code": "no_provider_for_trust_mode"
  }
}
```

The condition is transient (tier supply, not permissions), so clients should retry or switch to a model with a TeeML provider.

## Models with privacy mode

The live source of truth is the models endpoint: any model with `"verifiability": "TeeML"` accepts `private` requests. No authentication required:

```bash
curl -s https://router-api.0g.ai/v1/models | jq '.data[] | select(.verifiability == "TeeML") | .name'
```

The catalog changes as providers join the network; per-provider tiers are shown on each model's detail page at pc.0g.ai.

## Auditing

- Account usage endpoints break down consumption by trust tier, so you can report exactly which share of traffic ran sealed, per day and per model.
- Add `verify_tee: true` to any request to have the Router verify the provider's TEE signature synchronously; see [Verifiable Execution](./features/verifiable-execution.md).
- Provider attestations can be independently verified with [dstack-verifier](https://github.com/Dstack-TEE/dstack), and the verification mechanics are documented under [verification modes](../inference.md#verification-modes).
