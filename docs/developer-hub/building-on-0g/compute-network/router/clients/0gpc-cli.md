---
id: 0gpc-cli
title: 0gpc CLI
sidebar_position: 0
description: "Connect Claude Code, OpenCode, Pi, or Hermes Agent to the 0G Compute Router with one command — preview every change, undo any time."
keywords: [0gpc, CLI, Claude Code, OpenCode, Pi, Hermes Agent, 0G Private Computer, Router, coding tools]
---

# 0gpc CLI

`0gpc` connects the coding tools you already use to [0G Private Computer](https://pc.0g.ai)
models on the Router. Pick a tool and a model, enter your [API key](../authentication)
once, and 0gpc writes the configuration — showing every change before it saves, and able
to undo it later.

## Supported tools

| Tool | Notes |
|---|---|
| Claude Code | Project and user scope |
| OpenCode V1 | Project and user scope; OpenCode V2 is not supported yet |
| Pi | User scope only |
| Hermes Agent | User scope only; default profile only |

## Install

**Requirements:**

1. macOS or Linux
2. Node.js 22 or later ([download Node.js](https://nodejs.org/en/download/); with nvm: `nvm install 22 && nvm use 22`)
3. At least one supported coding tool
4. A 0G API key: [pc.0g.ai/dashboard/api-keys](https://pc.0g.ai/dashboard/api-keys) (see [Quickstart](../quickstart) steps 1–3)

**Option 1: run without installing**

```sh
npx @0gfoundation/0gpc@latest
```

**Option 2: install globally (for the shorter `0gpc` command)**

```sh
# Install or upgrade
npm install -g @0gfoundation/0gpc@latest

# Start in your project directory
0gpc
```

Use **↑ / ↓** to move, **Enter** to confirm and **Ctrl-C** to cancel.

:::note Migrating from `@0xdragon888/0gpc`
Run `npm uninstall -g @0xdragon888/0gpc` first, then install the new package. Your
configuration and key are kept, so you do not need to connect again.
:::

## Set up

The first time you run `0gpc`, a guided setup starts:

1. **Environment check**: finds which tools are installed and whether they are recent enough. For a missing tool, 0gpc shows the official install command and guide link. **It only shows them; it never runs them for you.**
2. **Key input**: your key is hidden as you type it. You can also pipe it in with `--stdin`.
3. **Model selection**: loads the Router's model catalog and shows each model's provider, context length and capabilities. Models that are not compatible with the tool are filtered out. If the catalog does not provide a field, 0gpc shows it as unknown instead of making up a value.
4. **Change preview**: lists every file to be written and every field to be changed (`+` added / `=` unchanged / `−` removed). Nothing is written until you confirm.
5. **Optional verification**: you decide whether to send one minimal request to verify your key (this may cost a very small amount). After verification, you can launch the tool directly.

You can connect several tools in one setup: enter your key once, choose a model for each
tool, and review one combined preview. Results are reported separately for each tool.

## Manage connections

Run `0gpc` again after setup to open the management menu, where you can:

- **Change models**: pick a different compatible model for a connected tool.
- **Add or disconnect tools**: connect a new tool, or disconnect one. Disconnecting removes only the settings 0gpc added.
- **Replace your key**: after you replace a key, every tool using it is updated automatically.
- **View history and undo**: see what has changed and undo the latest change. If you edited that setting yourself, 0gpc first shows you what it wrote, what's there now and what it will restore, then asks you to confirm.

## Diagnose

- **Check connections**: see which tools are connected and which model each one uses, and list the models you can choose from.
- **Local check**: without going online, checks whether your setup is complete or has been changed, and tells you what to do next.
- **Online check**: confirms that your key works and that you have enough balance. If something's wrong, it tells you whether the key is invalid, your balance is too low, you don't have permission, or the model can't be found. See [Errors](../errors).
- **Proxy hint**: if you're behind a proxy and can't connect, it tells you how to fix it, without showing your proxy address.

## Command reference

The examples below use the global `0gpc` command. Without a global install, replace it
with `npx @0gfoundation/0gpc@latest`.

```sh
# Help / version
0gpc -h
0gpc -v

# First-time setup, or manage existing connections
0gpc

# API key management
0gpc key set                   # Save or replace a key using hidden input
0gpc key set --stdin           # Read a key from piped standard input
0gpc key rm                    # Remove an unused saved key

# Show connections
0gpc status
0gpc status --json             # Machine-readable output

# Health checks
0gpc doctor --offline          # Check local configuration
0gpc doctor --offline --strict # Fail on warnings as well as errors
0gpc doctor --network          # Verify access; may incur a charge

# Preview configuration (run from your project root)
0gpc apply claude --scope project --model <model-id> --dry-run

# Save configuration
0gpc apply claude --scope project --model <model-id> --yes

# Disconnect a tool; keep the saved key
0gpc reset claude --yes
```

- Tool IDs: `claude`, `opencode`, `pi`, `hermes`
- Scopes: `project` or `user`; Pi and Hermes support `user` only

For CI or team onboarding scripts, combine `apply --dry-run`, `--json` output and 0gpc's
fixed exit codes.

## File locations

| Default path | Contents |
|---|---|
| `~/.config/0gpc/config.toml` | Connections and preferences |
| `~/.local/share/0gpc/keys/` | Saved API keys |
| `~/.local/state/0gpc/` | Change records and backups |

XDG paths are supported, and `ZGPC_HOME` sets a custom storage location.

| Tool | Configuration files 0gpc writes |
|---|---|
| Claude Code | Project: `.claude/settings.local.json`; user: `~/.claude/settings.json` |
| OpenCode V1 | Project: `opencode.json` or `opencode.jsonc`; user: under `~/.config/opencode/` |
| Pi | `~/.pi/agent/models.json` and `~/.pi/agent/settings.json` |
| Hermes Agent | `~/.hermes/config.yaml` and `~/.hermes/.env` |

## Safety guarantees

- 0gpc only touches the fields it writes, shows them before saving, and can restore what was there before.
- Your key is stored in one place and never appears in logs, terminal output or JSON.
- Nothing that costs money happens without your confirmation.
- 0gpc sends no telemetry and never updates or installs anything on its own.

To configure a tool by hand instead, see [Claude Code](./claude-code).
