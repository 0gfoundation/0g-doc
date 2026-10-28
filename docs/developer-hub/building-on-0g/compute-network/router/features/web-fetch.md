---
id: web-fetch
title: Web Fetch
sidebar_position: 6
description: "Let the model read web pages by URL, over several rounds, with the 0g:web_fetch tool and a per-page fee."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Web Fetch

The `0g:web_fetch` tool lets the model read web pages by URL. The model decides which pages it needs, the Router fetches them and returns their text to the model, and the model can then fetch more pages (for example, a link on a page it just read) before it answers. It works on `POST /v1/chat/completions` and `POST /v1/messages`, with any model that supports tool calling.

## Request

Add `{"type": "0g:web_fetch"}` to `tools`.

<Tabs>
<TabItem value="chat" label="Chat Completions" default>

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Read https://example.com, follow its link, and tell me the title of the linked page."}],
    "tools": [{"type": "0g:web_fetch", "max_uses": 3}]
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
    "messages": [{"role": "user", "content": "Read https://example.com, follow its link, and tell me the title of the linked page."}],
    "tools": [{"type": "0g:web_fetch", "max_uses": 3}]
  }'
```

</TabItem>
</Tabs>

| Field | Type | Description |
| --- | --- | --- |
| `type` | string | `"0g:web_fetch"` |
| `max_uses` | integer | Optional. How many different URLs the Router will try to fetch in this request; a failed fetch counts too. Default `5`, at most `20` |
| `max_content_tokens` | integer | Optional. How much of each page the model gets, in tokens (about 4 characters each). Default `5000`, at most `25000` |
| `allowed_domains` | string[] | Optional. Only fetch pages on these domains (subdomains included) |
| `blocked_domains` | string[] | Optional. Never fetch pages on these domains (subdomains included) |

OpenRouter's `{"type": "openrouter:web_fetch", "parameters": {...}}` form is accepted too.

## How it runs

1. The Router sends your request to the model with a `web_fetch` function added.
2. If the model answers without calling it, that answer is your response.
3. If it calls it, the Router fetches the requested pages, gives their text to the model as tool results, and asks the model again. The model can fetch more pages or answer.
4. After 5 rounds of fetching, the model is told to answer with what it has.

Things to know:

- **Fetch failures don't fail the request.** A page that cannot be fetched, a URL that is not `http`/`https`, a domain outside your filters, or reaching `max_uses` goes back to the model as an error for that call, and the model continues.
- **Page text only.** The model gets the page's URL, title and text, not images.
- **Your own tools work alongside it.** List your function tools in the same `tools` array. If the model calls one of yours without fetching in the same turn, you get that tool call as usual. If it calls yours and `web_fetch` in the same turn, your call is dropped; the model can call it again in a later turn.
- **Name clash.** If one of your own tools is named `web_fetch`, the Router removes the `0g:web_fetch` tool and sends the request without it.
- **Streaming waits for the answer.** With `"stream": true`, the Router gets the model's complete answer first (after any fetching), then sends it to you as Server-Sent Events. The first bytes arrive only when the answer is ready, even when the model fetches nothing.
- **Never sent to the provider.** The `0g:web_fetch` entry is always removed before the request is forwarded. If fetching is unavailable for the request, the model answers without it.
- **Fetched pages add no citations.** Unlike web search results, fetched pages are not returned as `url_citation` annotations.

## Billing

Each page fetched costs **$0.001**, on top of the model's token charges.

- **Free:** a fetch that fails, a page fetched again in the same request, and any request to a free model.
- **Tokens:** every round is a model turn billed on its own token counts. Fetched page text is part of the next turn's input, so it is billed as input tokens.

The fee shows up in [`x_0g_trace.billing`](./chat-completions#x_0g_trace-always-present). It is included in `input_cost` and `total_cost` and reported on its own in `web_fetch_cost`, in the same unit as the other cost fields: micro-USD for a USD-settled account, so two pages fetched show as `2000`:

```json
"x_0g_trace": {
  "billing": {
    "currency": "usd",
    "input_cost": "2549",
    "output_cost": "318",
    "total_cost": "2867",
    "web_fetch_cost": "2000"
  }
}
```

`x_0g_trace.billing` covers every round, while `usage` in the response is the answering turn only. In your usage history, each fetching round is its own entry, with the request ID plus `-wf1`, `-wf2`, and so on.

A 0G-settled account pays the fee in 0G, converted from the USD price at the Router's current 0G/USD rate; the cost fields are then in wei. If no current rate is available, the request is served without the tool rather than charged.

## Related

- [**Chat Completions**](./chat-completions) — request and response shape
- [**Models**](../models) — check which models support tool calling
- [**Errors**](../errors) — response codes and error shapes
