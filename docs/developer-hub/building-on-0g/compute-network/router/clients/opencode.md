---
id: opencode
title: OpenCode
sidebar_position: 2
description: "Configure OpenCode to run on the 0G Compute Router as a custom provider."
keywords: [OpenCode, 0G Private Computer, Router, custom provider, OG_API_KEY, coding tools]
---

# OpenCode

[OpenCode](https://opencode.ai) reaches the Router as a custom provider over the OpenAI
Chat Completions API. Configuration only — no plugin.

:::tip Skip the manual setup
[0gpc](./0gpc-cli) writes this configuration for you, previews every change, and can undo it.
:::

## Configure

Export a Router [API key](../authentication):

```bash
export OG_API_KEY=YOUR_API_KEY
```

Add a `0g` provider to `opencode.json` in your project, or to
`~/.config/opencode/opencode.json` for every project:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "0g": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "0G",
      "options": {
        "baseURL": "https://router-api.0g.ai/v1",
        "apiKey": "{env:OG_API_KEY}"
      },
      "models": {
        "glm-5.3": { "name": "GLM-5.3" },
        "claude-sonnet-5.5": { "name": "Claude Sonnet 5.5" }
      }
    }
  },
  "model": "0g/glm-5.3"
}
```

Then run:

```bash
opencode
```

`opencode models 0g` lists the models you added. Switch with `/models`, or start with
`opencode -m 0g/claude-sonnet-5.5`.

## Notes

- **Models are listed by hand.** OpenCode shows only the models under `models`; add any
  `id` from the [model list](./connection-settings#the-values) the same way.
- **`{env:OG_API_KEY}`** keeps the key out of the file. `{file:/path/to/key}` reads it from
  a file instead.
- OpenCode V1 configuration. OpenCode V2 is not covered yet.
