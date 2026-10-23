---
id: embeddings
title: Embeddings
sidebar_position: 6
description: "Turn text into vectors with the OpenAI-compatible /v1/embeddings endpoint, billed on input tokens."
---

# Embeddings

**`POST /v1/embeddings`**

Compatible with the [OpenAI Embeddings API](https://developers.openai.com/api/reference/resources/embeddings/methods/create). Send text, get back one vector per input. Synchronous: one JSON response, no streaming.

## Request

```bash
curl https://router-api.0g.ai/v1/embeddings \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-embedding-0.6b",
    "input": ["The quick brown fox", "jumps over the lazy dog"]
  }'
```

| Field             | Required | Description |
| ----------------- | -------- | ----------- |
| `model`           | Yes      | An embedding model ID from [`/v1/models`](../models) (entries with `"type": "embedding"`) |
| `input`           | Yes      | A string, or an array of strings, to embed. Must not be empty |
| `encoding_format` | No       | `float` (default) or `base64` |
| `dimensions`      | No       | Output vector size. Only for models that list `dimensions` in `supported_parameters` |

The body is forwarded to the provider as sent, so what a model accepts beyond `model` and `input` is listed in its `supported_parameters` on [`/v1/models`](../models). Each model's description there also states its vector size and maximum input length.

## Response

```json
{
  "object": "list",
  "model": "qwen3-embedding-0.6b",
  "data": [
    { "object": "embedding", "index": 0, "embedding": [-0.000614, -0.023559, -0.009582, ...] },
    { "object": "embedding", "index": 1, "embedding": [0.080566, -0.056640, -0.009338, ...] }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 0,
    "total_tokens": 12
  },
  "x_0g_trace": {
    "request_id": "988bdd6e-3c69-4401-8755-a9311100702b",
    "provider": "0xBF76Bb4c23f51324c11884B5547fE8CF1398F1FE",
    "billing": {
      "currency": "0g",
      "input_cost": "231600000000",
      "output_cost": "0",
      "total_cost": "231600000000",
      "total_cost_usd_micro": "1"
    }
  }
}
```

`data[i].index` matches the position of the input it embeds. See [`x_0g_trace`](./chat-completions#x_0g_trace-always-present) for the trace fields.

## Finding Embedding Models

List models and keep those with `"type": "embedding"`:

```bash
curl -s https://router-api.0g.ai/v1/models | jq '.data[] | select(.type == "embedding") | .id'
```

To see the providers serving them, filter `/v1/providers` by service type:

```bash
curl "https://router-api.0g.ai/v1/providers?service_type=embedding"
```

## Billing

You pay for **input tokens only**, at the model's `pricing.prompt` (or `pricing_usd.prompt` for USD accounts). There is no output charge. The cost of each request is in `x_0g_trace.billing`.

## Provider Routing

The `X-0G-Provider-*` headers work here as on chat. `X-0G-Provider-Max-Price-Usd-Prompt` caps the per-1M-input-token price; the completion and image ceilings do not apply. See [Provider Routing](../routing).

## Errors

| Status | `code`             | When |
| ------ | ------------------ | ---- |
| 400    | `invalid_request`  | `model` or `input` is missing or empty, or the body is not valid JSON |
| 402    | `insufficient_balance` | Not enough balance — [deposit more](../account/deposits) |
| 404    | `model_not_found`  | Unknown model ID |
| 503    | `no_available_provider` | No healthy provider can serve the model right now |

The provider's own validation errors (for example an unsupported `dimensions` value) are returned with the provider's status. See [Errors](../errors) for the full list.

## Related

- [**Models**](../models) — list available models and prices
- [**Provider Routing**](../routing)
