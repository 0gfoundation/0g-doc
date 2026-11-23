---
id: litellm
title: LiteLLM
sidebar_position: 5
description: "Call the 0G Compute Router from LiteLLM through its OpenAI-compatible and Anthropic routes."
keywords: [LiteLLM, 0G Private Computer, Router, OpenAI compatible, Anthropic, OG_API_KEY, Python]
---

# LiteLLM

[LiteLLM](https://docs.litellm.ai) calls the Router through its generic OpenAI-compatible
route: the `openai/` prefix with the Router's base URL.

## Python SDK

```bash
export OG_API_KEY=YOUR_API_KEY
```

```python
import os
import litellm

response = litellm.completion(
    model="openai/glm-5.3",
    api_base="https://router-api.0g.ai/v1",
    api_key=os.environ["OG_API_KEY"],
    extra_headers={"X-Title": "LiteLLM", "HTTP-Referer": "https://litellm.ai"},
    messages=[{"role": "user", "content": "Reply with: ok"}],
)
print(response.choices[0].message.content)
```

Models that serve the Anthropic format can also go through LiteLLM's `anthropic/` route,
with the base URL without `/v1`:

```python
response = litellm.completion(
    model="anthropic/claude-sonnet-5.5",
    api_base="https://router-api.0g.ai",
    api_key=os.environ["OG_API_KEY"],
    extra_headers={"X-Title": "LiteLLM", "HTTP-Referer": "https://litellm.ai"},
    max_tokens=1024,
    messages=[{"role": "user", "content": "Reply with: ok"}],
)
```

## Notes

- `extra_headers` names the tool in your usage records. On the `openai/` route LiteLLM sends
  the OpenAI SDK's User-Agent, so without `X-Title` its requests are recorded as the OpenAI SDK.
- Any `id` from the [model list](./connection-settings#the-values) works after `openai/`.
