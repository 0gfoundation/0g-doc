---
id: connection-settings
title: Connection Settings
sidebar_position: -1
description: "The base URL, API key and model IDs any client needs to reach the 0G Compute Router, and which tools have a setup page."
keywords: [0G Private Computer, Router, base URL, API key, OpenAI compatible, Anthropic compatible, OG_API_KEY, coding tools]
---

# Connection Settings

Every client reaches the Router with the same three values: a base URL, an API key and a
model ID. Tools with their own page below need only those; any other tool that lets you
add an OpenAI-compatible or Anthropic-compatible provider works the same way.

## The values

| Setting | Value |
|---|---|
| Base URL, OpenAI format (Chat Completions, Responses) | `https://router-api.0g.ai/v1` |
| Base URL, Anthropic format (Messages) | `https://router-api.0g.ai` — the client adds `/v1/messages` itself |
| API key | An `sk-` key from [pc.0g.ai](https://pc.0g.ai) → Dashboard → API Keys ([Authentication](../authentication)) |
| Key environment variable | `OG_API_KEY` — the name the setup pages below use |
| Provider ID | `0g`, so models read `0g/<model>` in tools that prefix them |
| Model ID | Any `id` from the model list below, e.g. `glm-5.3` |

The model list is public and needs no key:

```bash
curl -s https://router-api.0g.ai/v1/models | jq -r '.data[] | select(.type == "chatbot") | .id'
```

Each entry also gives `context_length`, `max_completion_tokens`, `supported_formats`
(`openai`, `anthropic`, `responses`) and `supported_parameters`. A client that speaks only
one format needs a model listing it. See [Models](../models) for prices.

To check a key before configuring a tool:

```bash
curl -s https://router-api.0g.ai/v1/chat/completions \
  -H "Authorization: Bearer $OG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "glm-5.3", "messages": [{"role": "user", "content": "Reply with: ok"}]}' \
  | jq -r '.choices[0].message.content'
```

## Tools

| Tool | Setup |
|---|---|
| Claude Code | [Claude Code](./claude-code), or one command with [0gpc](./0gpc-cli) |
| OpenCode | [OpenCode](./opencode), or [0gpc](./0gpc-cli) |
| Pi | [Pi](./pi), or [0gpc](./0gpc-cli) |
| Hermes Agent | [0gpc](./0gpc-cli) |
| Crush | [Crush](./crush) |
| LiteLLM | [LiteLLM](./litellm) |
| Any other client with an OpenAI-compatible provider (for example Cline, Roo Code, Kilo Code, Continue, Cherry Studio, LobeHub, Open WebUI) | Add an "OpenAI Compatible" provider with the base URL, key and model ID above |

If a tool lets you add custom headers, also send `X-Title` with the tool's name and
`HTTP-Referer` with its website (for Cline: `X-Title: Cline`, `HTTP-Referer: https://cline.bot`).
Usage records name the client from these headers or its User-Agent; a tool that sends a
generic SDK User-Agent and no `X-Title` is recorded as that SDK.

## Trust mode

Requests run under the API key's default trust mode. To set it per request, send
`X-0G-Provider-Trust-Mode: verified` or `private` in a client that allows custom headers.
A key created with trust mode **Private** routes only to TEE-backed providers whatever the
client sends. See [Privacy & ZDR](../privacy).
