---
id: crush
title: Crush
sidebar_position: 4
description: "Configure Crush to run on the 0G Compute Router as an OpenAI-compatible provider."
keywords: [Crush, Charm, 0G Private Computer, Router, openai-compat, OG_API_KEY, coding tools]
---

# Crush

[Crush](https://github.com/charmbracelet/crush) reaches the Router as an
`openai-compat` provider. Configuration only — no plugin.

## Configure

Export a Router [API key](../authentication):

```bash
export OG_API_KEY=YOUR_API_KEY
```

Add a `0g` provider to `crush.json` in your project, or to
`~/.config/crush/crush.json` for every project:

```json
{
  "$schema": "https://charm.land/crush.json",
  "providers": {
    "0g": {
      "name": "0G",
      "type": "openai-compat",
      "base_url": "https://router-api.0g.ai/v1",
      "api_key": "$OG_API_KEY",
      "models": [
        { "id": "glm-5.3", "name": "GLM-5.3" },
        { "id": "0gm-1.0-35b-a3b", "name": "0GM 1.0" }
      ]
    }
  },
  "models": {
    "large": { "provider": "0g", "model": "glm-5.3" },
    "small": { "provider": "0g", "model": "0gm-1.0-35b-a3b" }
  }
}
```

Then run:

```bash
crush
```

`crush models` lists them as `0g/<model>`.

## Notes

- **`large`** is the model you chat with; **`small`** handles background work such as
  session titles. A cheaper model fits `small`.
- **Models are listed by hand.** Add any `id` from the
  [model list](./connection-settings#the-values) under `models`. Each entry also takes
  `context_window` and `default_max_tokens`; take them from the model's
  `context_length` and `max_completion_tokens`.
