---
id: decisions
title: Decisions
sidebar_position: 7
description: "Ask a decision model typed yes/no, choice and score questions about a piece of state via /v1/decisions, and get probabilities back instead of text."
---

# Decisions

**`POST /v1/decisions`**

Send a piece of state (a support ticket, a message, an app event) and a set of named, typed questions about it. A decision model answers each question with a typed value and its probabilities — never generated text. Use it for classification, routing and guardrail checks where you would otherwise prompt a chat model and parse its reply.

Synchronous: one JSON response, no streaming.

## Request

```bash
curl https://router-api.0g.ai/v1/decisions \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "laya",
    "state": "Ticket 4412: the checkout page goes blank after I press Pay, and I was charged twice.",
    "questions": {
      "is_bug": {
        "type": "noul",
        "instructions": "Is this a defect report?",
        "criteria": {"true": "something is malfunctioning", "false": "a question or feature request"}
      },
      "team": {
        "type": "choice",
        "instructions": "Which team should handle it?",
        "criteria": {"frontend": "web UI issues", "payments": "billing and charges", "sales": "pricing questions"}
      },
      "urgency": {
        "type": "score",
        "instructions": "How urgent is it?",
        "criteria": ["low", "medium", "high"]
      }
    }
  }'
```

| Field       | Required | Description |
| ----------- | -------- | ----------- |
| `model`     | Yes      | A decision model ID from [`/v1/models`](../models) (entries with `"type": "decisions"`) |
| `state`     | Yes      | What the questions are about. Usually a string; must not be empty |
| `questions` | Yes      | An object of named questions. Each key is your name for the question and comes back as a key in `answers`. Must not be empty |

### Question types

Every question has a `type`, `instructions` (the question in plain language) and `criteria`, whose shape depends on the type:

| `type`   | Asks              | `criteria` |
| -------- | ----------------- | ---------- |
| `noul`   | Yes or no         | Object with `true` and `false` keys, each describing when that answer applies |
| `choice` | Pick one label    | Object of label → description, or an array of labels |
| `score`  | Pick a level      | Array of level descriptions, lowest first (index `0` is the first level) |

The model validates the questions. A malformed question is rejected with the model's error message in `error.metadata.raw`, naming the question at fault.

Some models accept more question types than these three; each model's description on [`/v1/models`](../models) lists what it supports and its maximum input length (longer state may be truncated).

## Response

```json
{
  "model": "laya",
  "answers": {
    "is_bug": { "type": "noul", "noul": 0.8572 },
    "team": {
      "type": "choice",
      "choice": "payments",
      "probabilities": { "frontend": 0.1591, "payments": 0.822, "sales": 0.0189 },
      "confidence": 0.5189
    },
    "urgency": {
      "type": "score",
      "score": 0.3949,
      "legend": { "0": "low", "1": "medium", "2": "high" },
      "probabilities": { "0": 0.6507, "1": 0.3038, "2": 0.0455 },
      "confidence": 0.288
    }
  },
  "usage": { "input_tokens": 150, "output_tokens": 0 },
  "x_0g_trace": {
    "request_id": "cd27cc56-3093-41e9-974e-402efa603b79",
    "provider": "0x743cD1F17903cF6cC94ff4792b51929876f51023",
    "billing": {
      "currency": "0g",
      "input_cost": "0",
      "output_cost": "0",
      "total_cost": "0",
      "total_cost_usd_micro": "0"
    }
  }
}
```

| Answer type | Fields |
| ----------- | ------ |
| `noul`      | `noul` — probability that the answer is `true` |
| `choice`    | `choice` — the most likely label; `probabilities` — per label; `confidence` |
| `score`     | `score` — a value on your level scale (`0` = first level); `legend` — level index → your description; `probabilities` — per level; `confidence` |

Models may return extra fields alongside these (for example per-answer metadata); ignore what you don't use. Note that `usage` here names its counts `input_tokens` / `output_tokens`. See [`x_0g_trace`](./chat-completions#x_0g_trace-always-present) for the trace fields.

## Finding Decision Models

```bash
curl -s https://router-api.0g.ai/v1/models | jq '.data[] | select(.type == "decisions") | .id'
```

To see the providers serving them:

```bash
curl "https://router-api.0g.ai/v1/providers?service_type=decisions"
```

## Billing

You pay for **input tokens only** — the state plus your questions — at the model's `pricing.prompt` (or `pricing_usd.prompt` for USD accounts). The reported `output_tokens` are not billed. Check current prices on [`/v1/models`](../models); the cost of each request is in `x_0g_trace.billing`.

## Provider Routing

The `X-0G-Provider-*` headers work here as on chat. `X-0G-Provider-Max-Price-Usd-Prompt` caps the per-1M-input-token price; the completion and image ceilings do not apply. See [Provider Routing](../routing).

## Errors

| Status | `code`                  | When |
| ------ | ----------------------- | ---- |
| 400    | `invalid_request`       | `model`, `state` or `questions` is missing or empty, or the body is not valid JSON |
| 402    | `insufficient_balance`  | Not enough balance — [deposit more](../account/deposits) |
| 404    | `model_not_found`       | Unknown model ID |
| 4xx    | —                       | The model rejected a question; its message is in `error.metadata.raw` |
| 503    | `no_available_provider` | No healthy provider can serve the model right now |

See [Errors](../errors) for the full list.

## Related

- [**Models**](../models) — list available models and prices
- [**Provider Routing**](../routing)
