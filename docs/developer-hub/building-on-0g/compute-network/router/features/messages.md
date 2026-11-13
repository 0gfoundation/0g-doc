---
id: messages
title: Anthropic Messages
sidebar_position: 2
description: "Anthropic-compatible /v1/messages for models that serve the Anthropic Messages format, including Claude Code."
---

# Anthropic Messages

**`POST /v1/messages`**

Compatible with the [Anthropic Messages API](https://docs.anthropic.com/en/api/messages). Send the same request body an Anthropic SDK sends — `model`, `max_tokens` and `messages` are required — and you get an Anthropic-shaped response back. This is the endpoint [Claude Code](../clients/claude-code) uses.

## Which models

Only models that serve the Anthropic format are available here. Check `supported_formats` on [`GET /v1/models`](../models):

```bash
curl -s https://router-api.0g.ai/v1/models \
  | jq -r '.data[] | select(.supported_formats | index("anthropic")) | .id'
```

| `supported_formats`         | `/v1/chat/completions` | `/v1/messages` |
| --------------------------- | ---------------------- | -------------- |
| `["openai"]`                | Yes                    | No — `400`     |
| `["openai", "anthropic"]`   | Yes                    | Yes            |
| `["anthropic"]`             | No — `400 model_format_mismatch` | Yes  |

Model IDs accept either `.` or `-` between version digits: `claude-opus-4.8` resolves to `claude-opus-4-8`, and `claude-fable-5-1` to `claude-fable-5.1`. The response carries the listed ID.

## Request

```bash
curl https://router-api.0g.ai/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "0gm-1.0-35b-a3b",
    "max_tokens": 256,
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
  }'
```

You can authenticate with `Authorization: Bearer sk-YOUR_API_KEY` or with Anthropic's `x-api-key: sk-YOUR_API_KEY` header, so Anthropic SDKs work by changing only the base URL to `https://router-api.0g.ai`.

[Provider routing](../routing) works the same as on chat completions: send `X-0G-Provider-*` headers to sort, pin or cap price.

## Response

The body follows the Anthropic `message` shape, plus an `x_0g_trace` object at the top level:

```json
{
  "id": "chatcmpl-7d165186-512e-4279-9877-30038f6ac8aa",
  "type": "message",
  "role": "assistant",
  "model": "0gm-1.0-35b-a3b",
  "content": [
    {"type": "thinking", "thinking": "..."},
    {"type": "text", "text": "Hello! How can I assist you today?"}
  ],
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 36, "output_tokens": 131},
  "x_0g_trace": {
    "request_id": "cce1e904-819a-4ca6-bb82-d5924dfcacf5",
    "provider": "0x4870CbC4D07d6Ac2EE5aA865588e5985FE77a4E9",
    "billing": {
      "input_cost": "11520000000000",
      "output_cost": "251520000000000",
      "total_cost": "263040000000000"
    }
  }
}
```

`x_0g_trace` is described in [Chat Completions](./chat-completions#x_0g_trace-always-present).

## Streaming

Set `"stream": true` to receive standard Anthropic stream events. The Router adds `x_0g_trace` as an extra field on the **last** `message_delta` event, just before `message_stop`:

```text
event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":64},"x_0g_trace":{"request_id":"...","provider":"0x...","billing":{...}}}

event: message_stop
data: {"type":"message_stop"}
```

- There may be more than one `message_delta`; only the last one carries `x_0g_trace`.
- If `x_0g_trace` is missing, treat it as not available for that response, not as an error.
- Some SDKs drop unknown fields from parsed events. If yours does, read the raw event payload.

## Errors

Errors use the Anthropic error shape, with no `code` field:

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "model \"some-model\" is not available on the anthropic API format (supported: openai); use POST /v1/chat/completions instead"
  }
}
```

| Status | `error.type`            | When                                                         |
| ------ | ----------------------- | ------------------------------------------------------------ |
| `400`  | `invalid_request_error` | Missing `model`, `max_tokens` or `messages`, or the model does not serve the Anthropic format |
| `402`  | `invalid_request_error` | Insufficient balance — [deposit more](../account/deposits)   |
| `404`  | `not_found_error`       | Unknown model ID                                             |
| `423`  | `invalid_request_error` | A refund is in progress on your account                      |
| `502`  | `api_error`             | The provider returned an error                               |
| `503`  | `api_error`             | No provider for the model is available right now             |

See [Errors](../errors) for retry guidance.

## Related

- [**Claude Code**](../clients/claude-code) — point Claude Code at the Router
- [**Chat Completions**](./chat-completions) — the OpenAI-compatible endpoint
- [**Routing**](../routing) — choose your provider
