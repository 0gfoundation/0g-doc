#!/usr/bin/env bash
# One-click: install Claude Code and point it at the 0G Router.
# Usage:  curl -fsSL https://docs.0g.ai/claude-code/install.sh | bash
#         curl -fsSL https://docs.0g.ai/claude-code/install.sh | bash -s -- sk-your-key
set -euo pipefail

BASE_URL="${ZG_BASE_URL:-https://router-api.0g.ai}"
MODEL="${ZG_MODEL:-glm-5.3}"
SMALL_MODEL="${ZG_SMALL_MODEL:-0gm-1.0-35b-a3b}"
MAX_CONTEXT="${ZG_MAX_CONTEXT_TOKENS:-983616}"
KEY="${ZG_API_KEY:-${1:-}}"
SETTINGS="$HOME/.claude/settings.json"

say() { printf '\033[36m==>\033[0m %s\n' "$*"; }
die() { printf '\033[31mError:\033[0m %s\n' "$*" >&2; exit 1; }

# 1. Claude Code itself
if command -v claude >/dev/null 2>&1; then
  say "Claude Code already installed ($(command -v claude))"
else
  say "Installing Claude Code..."
  curl -fsSL https://claude.ai/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
  command -v claude >/dev/null 2>&1 || die "Claude Code installed but 'claude' is not on PATH. Open a new shell and re-run."
fi

# 2. API key (read from the terminal, not stdin — stdin is the script when curl-piped)
if [ -z "$KEY" ]; then
  [ -r /dev/tty ] || die "No API key given. Re-run as: bash install.sh sk-your-key"
  printf 'Paste your 0G Router API key (https://pc.0g.ai -> API Keys): '
  read -r KEY < /dev/tty
fi
[ -n "$KEY" ] || die "No API key given."
case "$KEY" in *[\"\\]*) die "That does not look like a Router API key (it contains a quote or backslash)." ;; esac

# 3. Verify the key end-to-end with a 1-token request
if [ -n "${ZG_SKIP_VERIFY:-}" ]; then
  say "Skipping key verification."
else
  say "Verifying key against $BASE_URL ..."
  code=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/v1/messages" \
    -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
    -d "{\"model\":\"$MODEL\",\"max_tokens\":1,\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}" || true)
  case "$code" in
    2*)  say "Key OK." ;;
    401|403) die "Key rejected ($code). Check the key at https://pc.0g.ai -> API Keys." ;;
    402) die "Key is valid but the account has no balance. Top up at https://pc.0g.ai." ;;
    000) die "Cannot reach $BASE_URL." ;;
    *)   printf '\033[33mWarning:\033[0m verification returned HTTP %s; writing config anyway.\n' "$code" ;;
  esac
fi

# 4. Merge into ~/.claude/settings.json (never clobber an existing config)
mkdir -p "$(dirname "$SETTINGS")"
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
cat > "$tmp" <<JSON
{
  "env": {
    "ANTHROPIC_BASE_URL": "$BASE_URL",
    "ANTHROPIC_AUTH_TOKEN": "$KEY",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_MODEL": "$MODEL",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "$MODEL",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "$MODEL",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "$SMALL_MODEL",
    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "$MAX_CONTEXT"
  },
  "modelOverrides": {
    "claude-sonnet-5": "$SMALL_MODEL"
  }
}
JSON

if [ -s "$SETTINGS" ]; then
  backup="$SETTINGS.bak.$(date +%Y%m%d%H%M%S)"
  cp "$SETTINGS" "$backup"
  say "Existing settings backed up to $backup"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$SETTINGS" "$tmp" <<'PY'
import json, sys
path, new_path = sys.argv[1], sys.argv[2]
with open(path) as f: cur = json.load(f)
with open(new_path) as f: new = json.load(f)
for section, values in new.items():
    if not isinstance(cur.get(section), dict):
        cur[section] = {}
    cur[section].update(values)
with open(path, "w") as f: json.dump(cur, f, indent=2)
PY
  elif command -v jq >/dev/null 2>&1; then
    jq -s '.[0] * .[1]' "$SETTINGS" "$tmp" > "$SETTINGS.merged" && mv "$SETTINGS.merged" "$SETTINGS"
  else
    cp "$tmp" "$SETTINGS.0g-router-snippet.json"
    die "Need python3 or jq to merge into the existing $SETTINGS. Your config is untouched; merge $SETTINGS.0g-router-snippet.json by hand."
  fi
else
  cp "$tmp" "$SETTINGS"
fi
chmod 600 "$SETTINGS"

say "Done. Start with:  claude --permission-mode auto"
