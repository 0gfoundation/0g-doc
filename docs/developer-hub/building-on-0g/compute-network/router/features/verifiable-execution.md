---
id: verifiable-execution
title: Verifiable Execution
sidebar_label: Verifiable Execution
sidebar_position: 5
description: "Opt-in TEE signature verification for Router responses. Ask the Router to synchronously verify that a response came from an attested TEE provider."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Verifiable Execution

Providers on the `verified` and `private` [trust tiers](../routing#trust-modes) run inside a **Trusted Execution Environment (TEE)** and cryptographically sign their responses. The Router can verify that signature synchronously on your behalf and report the result back in the response metadata.

For **Private models** (TeeML, such as `glm-5.3`), the request is encrypted before it reaches the Router, so the Router cannot check the signature and the check happens one step earlier. See [Private models](#private-models).

## Opt in with `verify_tee`

Add `verify_tee: true` to any inference request, and the Router will verify the provider's TEE signature before returning the response. The verification result appears in the response trace.

<Tabs>
<TabItem value="json" label="JSON body" default>

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}],
    "verify_tee": true
  }'
```

</TabItem>
<TabItem value="query" label="Query parameter">

For endpoints that use `multipart/form-data` (like `/v1/audio/transcriptions` or image edits), pass `verify_tee` as a query parameter instead:

```bash
curl "https://router-api.0g.ai/v1/audio/transcriptions?verify_tee=true" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -F "file=@recording.mp3" \
  -F "model=openai/whisper-large-v3"
```

</TabItem>
</Tabs>

`verify_tee` is a 0G Router extension — it's stripped from the request before being forwarded to the provider, so it doesn't interfere with the OpenAI-compatible schema.

## Reading the result

When `verify_tee` is set, the Router adds a `tee_verified` field to the response's `x_0g_trace` metadata block (which is present on every Router response — see [Response shape](./chat-completions#response-shape)):

```json
"x_0g_trace": {
  "request_id": "0852f405-6c56-40c2-a800-e6fd70785065",
  "provider": "0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C",
  "billing": { "input_cost": "...", "output_cost": "...", "total_cost": "..." },
  "tee_verified": true
}
```

| `tee_verified` | Meaning |
| --- | --- |
| `true` | The provider's TEE signature was validated successfully |
| `false` | A signature was present but did not verify — treat the response as untrusted |
| absent | No verdict from the Router: verification was not requested, the response came from a Private model (see [Private models](#private-models)), or the provider is on the `standard` tier and signs nothing |

## Private models

Requests to Private models (TeeML providers, such as `glm-5.3`) on `router-api.0g.ai` are encrypted to the provider's enclave by the 0G gateway in front of the Router. The Router forwards ciphertext it cannot read, so it does not set `tee_verified` on these responses, **even with `verify_tee: true`**. This is expected, not a failed check.

The signature check runs in the gateway instead, on every request, whether or not you set `verify_tee`. The gateway runs inside a TEE and checks each response's signature against the TEE signer the provider registered on-chain:

- **Non-streaming:** a response whose signature does not verify is never delivered; you get an error instead.
- **Streaming:** the signature covers the whole response, so it can only be checked after the last chunk has been sent. If it fails, the stream ends with an error event (for chat completions, in place of `data: [DONE]`). Treat a streamed answer as verified only once the stream has finished normally.

These response headers tell you what happened:

| Header | Meaning |
| --- | --- |
| `X-0G-E2EE: sealed` | The request was encrypted to the provider's enclave and the response decrypted from it. `none` means the request went through unencrypted. |
| `X-Provider` | The provider the request was encrypted to. |
| `ZG-Res-Key` | The handle to fetch this response's signature from the provider (step 2 under [Without the SDK](#without-the-sdk)). |

You can fetch the signature with `ZG-Res-Key` and confirm it recovers to the provider's on-chain TEE signer (steps 1 to 3 below). Step 4 does not apply: for a Private model the provider signs hashes of the *encrypted* request and response, which only the gateway sees.

## When to use it

- **Most chat-like applications** don't need per-request verification — the provider is already inside a TEE, and the network tolerates a small rate of signed-but-unverified responses.
- **Audit logs, high-trust pipelines, and research workloads** benefit from setting `verify_tee: true` so that every response carries a validated attestation flag alongside it.
- The pc.0g.ai UI enables `verify_tee` by default for playground requests; feel free to mirror that behaviour in your own clients.

## Trust model

`verify_tee: true` asks the **Router** to fetch the provider's TEE signature, look up the signer address on-chain, and verify the signature on your behalf. The Router returns a single boolean (`tee_verified`) summarising that check.

In other words, `tee_verified: true` in the response says *"the Router says it verified the signature."* It does **not** carry the raw signature back to you — you still have to trust the Router to have done the check honestly.

If that level of trust is acceptable for your application, stop here: set `verify_tee: true` and read the flag.

If you need an independent guarantee, **all the inputs the Router uses are public**, and you can reproduce the verification yourself. See the next section.

## Independent verification (advanced)

You don't have to trust the Router's `tee_verified` flag — the underlying inputs are all public, and the `@0gfoundation/0g-compute-ts-sdk` SDK ships a one-shot helper that does the whole verification for you.

### With the SDK (recommended)

The `chatID` required for verification comes from the **`ZG-Res-Key` response header** (the `id` field in the JSON body is a fallback when the header is absent). That means you need access to the raw HTTP response headers — `fetch` works directly; for OpenAI SDKs use their "raw response" / "with-response" helper.

```typescript
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";

// Any wallet works — processResponse only reads the chain and calls the provider's public signature endpoint.
const rpc = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
const wallet = ethers.Wallet.createRandom().connect(rpc);
const broker = await createZGComputeNetworkBroker(wallet);

// 1. Make the request so you can read headers
const response = await fetch("https://router-api.0g.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-YOUR_API_KEY",
  },
  body: JSON.stringify({ model: "glm-5.2", messages: [...] }),
});
const data = await response.json();

// 2. Pull the two inputs processResponse needs
const providerAddress = data.x_0g_trace.provider;
const chatID          = response.headers.get("ZG-Res-Key") ?? data.id;

// 3. Verify independently — SDK reads the chain + calls the provider, not the Router
const isValid = await broker.inference.processResponse(providerAddress, chatID);
// true  → independently verified
// false → verification failed (treat response as untrusted)
// null  → provider has no verifiable TEE service (nothing to check)
```

Under the hood the SDK reads the provider's on-chain service record, fetches the signature from the provider, and verifies it against the TEE signer — the same work the Router does internally, but running on your side so you don't have to trust the Router's answer.

### Without the SDK

If you prefer to verify from scratch (e.g. from a language without the 0G SDK), the four steps you'd reproduce are:

1. Read the provider's service record from the on-chain `Service` contract using the `provider` address. The record gives you `url`, `teeSignerAddress`, and `verifiability`. (If `additionalInfo.targetSeparated` is true, use `additionalInfo.targetTeeAddress` as the signer instead.)
2. `GET {url}/v1/proxy/signature/{chatID}?model={model}` — returns `{text, signature}`.
3. Verify the signature as EIP-191 `personal_sign` against `teeSignerAddress`. Any standard Ethereum library works.
4. Confirm the signed `text` matches the response content you received from the Router.

All four steps pass → end-to-end cryptographic proof, no trust in the Router required.

## Related

- [**Principles: Verifiable Execution**](../principles#4-verifiable-execution) — the "why" behind this feature
- [**Chat Completions**](./chat-completions#response-shape) — structure of the `x_0g_trace` block
- [**Provider Routing**](../routing) — pin to a specific attested provider with `X-0G-Provider-Address`
