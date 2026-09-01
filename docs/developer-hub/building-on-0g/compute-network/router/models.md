---
id: models
title: Models
sidebar_position: 4
description: "Browse the live model catalog — pricing, context window, capabilities, and provider count."
---

# Models

The model catalog is served live by the Router. You can browse it two ways:

- **Web UI** — **[pc.0g.ai](https://pc.0g.ai)** shows every model with current pricing, the number of healthy providers, and capability badges (streaming, tool calling, vision, etc.).
- **API** — `GET /v1/models` returns the same data in OpenAI's list format. No authentication required.

## Listing Models

```bash
curl https://router-api.0g.ai/v1/models
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "zai-org/GLM-5-FP8",
      "object": "model",
      "owned_by": "0G Foundation",
      "name": "zai-org/GLM-5-FP8",
      "context_length": 131072,
      "pricing": {
        "prompt": "100000000000",
        "completion": "320000000000"
      },
      "provider_count": 3
    }
  ]
}
```

Prices are in **neuron per token** (1e18 neuron = 1 0G). Multiply by `input_tokens` / `output_tokens` to estimate cost.

## Capability Flags

Not every model supports every feature. Before relying on **tool calling**, **vision input**, or **JSON mode**, check the model's entry in the Web UI or in the `/v1/models` response — capability flags are shown on each model card and in the API payload.

If you send a `tools` field to a model that doesn't support it, the Router returns `400 Bad Request` rather than silently dropping the parameter.

## Listing Providers for a Model

```bash
curl "https://router-api.0g.ai/v1/providers?model=zai-org/GLM-5-FP8"
```

Returns every TEE-acknowledged provider serving that model, with on-chain address, observed latency, and TEE attestation info. Use these addresses with the [`X-0G-Provider-Address` header](./routing) if you want deterministic routing.

Each entry also carries `provider_identity` — the operator-declared name of the upstream channel serving that endpoint (for example `aliyun` or `openrouter`). It is a routing label, not an attested property; `verifiability` remains the trust signal. Endpoints serving a model through a single native channel omit the field. To route by channel, use the [`X-0G-Provider-Identity` header](./routing#header-reference) — it filters candidates rather than pinning one endpoint unless combined with an address. Independently of any pin, your usage history records which identity served each request.

Query parameters:

| Field          | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `model`        | Filter to providers serving a specific model ID                    |
| `service_type` | Filter by service type (e.g. `chatbot`, `text-to-image`, `speech-to-text`) |
