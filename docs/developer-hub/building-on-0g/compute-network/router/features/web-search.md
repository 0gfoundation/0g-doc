---
id: web-search
title: Web Search
sidebar_position: 5
description: "Ground answers in live web results with the web plugin or the 0g:web_search tool, with url_citation annotations and a per-search fee."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Web Search

The Router can search the web and add the results to the model's context, so the answer reflects current information and carries citations. It works with any model on `POST /v1/chat/completions` and `POST /v1/messages`, because the search runs in the Router, not in the model.

There are two ways to ask for it:

| | Web plugin | `0g:web_search` tool |
| --- | --- | --- |
| Request field | `"plugins": [{"id": "web"}]` | `{"type": "0g:web_search"}` in `tools` |
| Who decides to search | The Router, on every request | The model, only when it needs the web |
| Who writes the query | The Router, from the conversation | The model |
| Searches per request | 1 | Up to `max_uses` (default 1, at most 5) |
| Model turns | 1 | 1 without a search, 2 with one |
| Model requirement | Any chat model | A model that supports tool calling |

Both return the same `url_citation` annotations and are billed the same per-search fee.

## Web plugin

Add `plugins` to the request. The Router builds a search query from the conversation, runs the search, adds the results to the system prompt, and then sends the request to the model.

<Tabs>
<TabItem value="chat" label="Chat Completions" default>

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "qwen-flash",
    "messages": [{"role": "user", "content": "What is the latest stable release of the Go programming language?"}],
    "plugins": [{"id": "web"}]
  }'
```

</TabItem>
<TabItem value="messages" label="Messages">

```bash
curl https://router-api.0g.ai/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "glm-5.3-flash",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "What is the latest stable release of the Go programming language?"}],
    "plugins": [{"id": "web"}]
  }'
```

</TabItem>
</Tabs>

The `plugins` field is removed before the request reaches the provider. If the search fails or returns nothing, the request still succeeds: the model answers without search results.

## `0g:web_search` tool

Add `{"type": "0g:web_search"}` to `tools`. The model reads the conversation, decides whether it needs the web, and writes its own queries.

<Tabs>
<TabItem value="chat" label="Chat Completions" default>

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "qwen-flash",
    "messages": [{"role": "user", "content": "What is the latest stable release of the Go programming language?"}],
    "tools": [{"type": "0g:web_search", "max_uses": 2}]
  }'
```

</TabItem>
<TabItem value="messages" label="Messages">

```bash
curl https://router-api.0g.ai/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "glm-5.3-flash",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "What is the latest stable release of the Go programming language?"}],
    "tools": [{"type": "0g:web_search"}]
  }'
```

</TabItem>
</Tabs>

| Field | Type | Description |
| --- | --- | --- |
| `type` | string | `"0g:web_search"` |
| `max_uses` | integer | Optional. How many searches the model may run. Default `1`; values above `5` are treated as `5` |

How it runs:

1. **Deciding turn.** The Router sends your request to the model with a `web_search` function added. If the model answers without calling it, that answer is your response: one model turn, no search.
2. **Answering turn.** If the model calls it, the Router runs its queries (up to `max_uses`), adds the results to the system prompt, and sends the request again without the tool. The model's answer is your response.

Things to know:

- **Tool-calling models only.** The tool counts as `tools`, so a model without tool-calling support returns `400`. Check `supported_parameters` in the [catalog](../models).
- **Your own tools work alongside it.** List your function tools in the same `tools` array. If the model calls one of yours in the deciding turn without searching, you get that tool call as usual. If it searches, the answering turn decides tool calls again.
- **One search round.** The model cannot search again after it has seen the results.
- **Name clash.** If one of your own tools is named `web_search`, the Router removes the `0g:web_search` tool and sends the request without it.
- **Streaming waits for the deciding turn.** With `"stream": true`, the first bytes arrive only after the deciding turn has finished.
- **Never sent to the provider.** The `0g:web_search` entry is always removed before the request is forwarded. If search is unavailable for the request, the model answers without it.
- **One search source.** If a request has both the plugin and the tool and the plugin's search returns results, the tool is removed.

## Response

Answers built on search results carry `url_citation` annotations, one per result:

```json
{
  "type": "url_citation",
  "url_citation": {
    "url": "https://go.dev/VERSION",
    "title": "- The Go Programming Language",
    "content": "go1.27.1\ntime 2026-08-28T16:20:06Z"
  }
}
```

`content` is the snippet the model was given; it can be omitted. Where the annotations appear depends on the endpoint and on streaming:

| Endpoint | Non-streaming | Streaming |
| --- | --- | --- |
| `/v1/chat/completions` | `choices[0].message.annotations` | A final chunk before `[DONE]` with `choices[0].delta.annotations` |
| `/v1/messages` | Top-level `annotations` | Top-level `annotations` on the `message_delta` event |

No annotations are added when nothing was searched or the search returned no results.

## Billing

Each search that returns results costs **$0.02**, on top of the model's token charges.

- **Web plugin:** one search per request, so at most $0.02.
- **Tool:** $0.02 for each search that returned results, up to `max_uses`.
- **Free:** a search that fails or returns nothing, a request where the model decides not to search, and any request to a free model.
- **Tokens:** the search results added to the prompt are billed as input tokens. With the tool, a searching request runs two model turns and each is billed on its own token counts. When the model does not search, the request is a single turn, but its prompt includes the tool's definition, so it bills slightly more input than the same request without the tool.

The fee shows up in [`x_0g_trace.billing`](./chat-completions#x_0g_trace-always-present). It is included in `input_cost` and `total_cost` and reported on its own in `web_search_cost`, in the same unit as the other cost fields:

```json
"x_0g_trace": {
  "billing": {
    "currency": "0g",
    "input_cost": "77715595615710628",
    "output_cost": "100996942884488",
    "total_cost": "77816592558595116",
    "total_cost_usd_micro": "20057",
    "web_search_cost": "77596690811523652"
  }
}
```

For the tool, `x_0g_trace.billing` covers both turns, while `usage` in the response is the answering turn only. In your usage history, the deciding turn is its own entry, with the request ID plus `-ws`.

A 0G-settled account pays the fee in 0G, converted from the USD price at the Router's current 0G/USD rate and rounded up; the cost fields are then in wei. If no current rate is available, the request is served without search rather than charged.

:::note Anthropic's own `web_search` tool
On `/v1/messages`, you can also pass Anthropic's `web_search` server tool (for example `web_search_20250305`, which Claude Code's WebSearch uses). It is forwarded to the provider unchanged. Whether it works depends on the provider; when the provider runs searches itself and reports them in `usage.server_tool_use.web_search_requests`, each one is billed at the same per-search fee and included in `web_search_cost`.
:::

## Related

- [**Chat Completions**](./chat-completions) — request and response shape
- [**Models**](../models) — check which models support tool calling
- [**Errors**](../errors) — response codes and error shapes
