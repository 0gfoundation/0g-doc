---
id: claude-code
title: Claude Code
sidebar_position: 1
description: "Configure Claude Code to run on the 0G Compute Router."
---

# Claude Code

[Claude Code](https://code.claude.com/docs) reaches the Router over the Anthropic Messages
API, so it needs configuration only — no plugin, no proxy.

## Configure

Create `~/.claude/settings.json` (Windows: `C:\Users\<username>\.claude\settings.json`)
and replace `YOUR_API_KEY` with a Router [API key](../authentication):

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://router-api.0g.ai",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",
    "ANTHROPIC_API_KEY": "",

    "ANTHROPIC_MODEL": "glm-5.3",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "glm-5.3",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.3",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "0gm-1.0-35b-a3b",

    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "983616"
  },
  "modelOverrides": {
    "claude-sonnet-5": "0gm-1.0-35b-a3b"
  }
}
```

Then run:

```bash
claude --permission-mode auto
```

:::tip Private mode
Both models above are TEE-backed (`"verifiability": "TeeML"`). To guarantee every Claude
Code request runs inside an enclave, create the key with trust mode **Private** in
Dashboard → API Keys — that key routes only to TeeML providers regardless of what the
client sends. See [Privacy & ZDR](../privacy#enabling-privacy-mode).
:::

## Notes

- **`modelOverrides`** sets the model behind auto mode's permission gate, which runs
  before every non-read-only action. Use it rather than
  `ANTHROPIC_DEFAULT_SONNET_MODEL`: that one replaces the slot, leaving Claude Code
  unable to recognize the model, so it stops disabling reasoning and a yes/no check
  turns into a full reasoning pass.
- **`ANTHROPIC_DEFAULT_HAIKU_MODEL`** covers background work — session names for
  `claude --resume`, status for commands like `/usage`.
- **`CLAUDE_CODE_MAX_CONTEXT_TOKENS`** is the main model's real context window. Without
  it Claude Code assumes 200 K and compacts at a fifth of `glm-5.3`'s 1 M.
- **`--permission-mode auto`** is required per session, or set
  `{"permissions": {"defaultMode": "auto"}}` in `~/.claude/settings.json`. With an API
  key, sessions otherwise start in Manual mode.
- Everything under `env` also works as shell exports; `modelOverrides` does not.

## Models

Claude Code needs a model that serves the Anthropic Messages API:

```bash
curl -s https://router-api.0g.ai/v1/models \
  | jq -r '.data[] | select(.supported_formats | index("anthropic")) | .id'
```

Any of those work in any slot. See [Models](../models) for pricing and context windows.
