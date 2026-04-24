---
id: chat-completions
title: Chat Completions
sidebar_position: 1
description: "OpenAI-compatible /v1/chat/completions with streaming, tool calling, JSON mode, and reasoning tokens."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Chat Completions

**`POST /v1/chat/completions`**

Fully compatible with the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat). Supports streaming, tool calling, JSON mode, and reasoning-token models.

## Request

```json
{
  "model": "zai-org/GLM-5-FP8",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Explain quantum computing in simple terms."}
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": true
}
```

All standard OpenAI fields are accepted — `temperature`, `top_p`, `n`, `stop`, `presence_penalty`, `frequency_penalty`, `logit_bias`, `user`, `response_format`, and so on.

### 0G Router Extensions

Optional top-level fields. Stripped before the request is forwarded to the provider, so they never conflict with the OpenAI schema.

| Field        | Type    | Description                                                                          |
| ------------ | ------- | ------------------------------------------------------------------------------------ |
| `provider`   | object  | Control provider routing — see [Routing](../routing)                                 |
| `verify_tee` | boolean | Ask the Router to synchronously verify the provider's TEE signature — see [Verifiable Execution](./verifiable-execution) |

## Streaming

Set `"stream": true` to receive Server-Sent Events in the OpenAI SSE format. Any OpenAI client library that handles streaming will work unchanged.

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Write a haiku about decentralization"}],
    "stream": true
  }'
```

:::tip Reasoning models
Some models (e.g. GLM-5) emit a `reasoning_content` field in streaming deltas before the final `content`. Client libraries that know about reasoning tokens will surface both separately.
:::

## Tool Calling

Models that advertise tool-calling capability accept the standard OpenAI `tools` / `tool_choice` fields.

```json
{
  "model": "zai-org/GLM-5-FP8",
  "messages": [
    {"role": "user", "content": "What's the weather in Tokyo?"}
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {"type": "string"}
          },
          "required": ["city"]
        }
      }
    }
  ]
}
```

:::caution Check model capabilities
**Not every model supports tool calling.** Before sending a request with `tools`, verify the model's capability flags in the [catalog](../models) or on [pc.0g.ai](https://pc.0g.ai). Sending `tools` to a model that doesn't support it returns `400 Bad Request`.
:::

The response shape (`tool_calls` in the assistant message, `tool` role for results) matches OpenAI exactly.

## JSON Mode

For models that support structured output:

```json
{
  "model": "zai-org/GLM-5-FP8",
  "messages": [
    {"role": "system", "content": "Respond with JSON only."},
    {"role": "user", "content": "List three colors and their hex codes."}
  ],
  "response_format": {"type": "json_object"}
}
```

As with tool calling, check capability flags before using.

## Response shape

Responses are OpenAI-compatible (`choices[]`, `usage`, `model`, `id`, `object`, `created`). The Router adds two Router-specific additions on top:

### `x_0g_trace` (always present)

Every Router response carries an `x_0g_trace` object with metadata about the request's execution:

```json
"x_0g_trace": {
  "request_id": "0852f405-6c56-40c2-a800-e6fd70785065",
  "provider": "0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C",
  "billing": {
    "input_cost":  "19000000000000",
    "output_cost": "1916800000000000",
    "total_cost":  "1935800000000000"
  }
}
```

| Field | Description |
| --- | --- |
| `request_id` | Unique ID for this request. Quote it in any support ticket or bug report. |
| `provider` | On-chain address of the provider that served the request |
| `billing.input_cost` / `output_cost` / `total_cost` | Exact cost in **neuron** for this specific request |
| `tee_verified` | Present only when `verify_tee: true` was set — see [Verifiable Execution](./verifiable-execution) |

This means you don't need to compute costs yourself — the Router tells you exactly what was charged. Handy for per-request logging and client-side budget tracking.

### `reasoning_content` (thinking models)

For models with thinking support (e.g. `zai-org/GLM-5-FP8`), the Router returns the reasoning trace alongside the final answer. It appears in two equivalent places:

```json
"choices": [{
  "message": {
    "role": "assistant",
    "content": "{ \"colors\": [ ... ] }",
    "reasoning_content": "The user wants a JSON response...",
    "provider_specific_fields": {
      "reasoning_content": "The user wants a JSON response..."
    }
  }
}]
```

Both fields contain the same text; most OpenAI SDKs surface `reasoning_content` directly on the message. You can ignore it for production output, log it for debugging, or display it to the user as "thinking".

:::tip Disable thinking for GLM-5
Thinking is on by default for GLM-5. If you don't want it (saves tokens and latency), pass `chat_template_kwargs: {"enable_thinking": false}` in the request body — GLM-5 advertises this in its `supported_parameters`.
:::

## Related

- [**Routing**](../routing) — choose your provider
- [**Errors**](../errors) — response codes and error shapes
