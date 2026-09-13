#!/usr/bin/env bash
# Checks that static/claude-code/install.{sh,ps1} merge into an existing
# ~/.claude/settings.json instead of clobbering it. Run from the repo root.
# The PowerShell half needs Docker; it is skipped if Docker is unavailable.
set -euo pipefail
cd "$(dirname "$0")/.."
DIR="$PWD/static/claude-code"

seed='{"env":{"KEEP_ME":"yes","ANTHROPIC_MODEL":"old"},"permissions":{"defaultMode":"auto"}}'
assert='
import json, glob, sys
f = sys.argv[1]
d = json.load(open(f))
assert d["env"]["KEEP_ME"] == "yes", "clobbered an unrelated key"
assert d["permissions"]["defaultMode"] == "auto", "clobbered an unrelated section"
assert d["env"]["ANTHROPIC_MODEL"] == "glm-5.3", "did not override the model"
assert d["env"]["ANTHROPIC_AUTH_TOKEN"] == "sk-test123", "did not write the key"
assert d["modelOverrides"]["claude-sonnet-5"] == "0gm-1.0-35b-a3b", "no modelOverrides"
assert glob.glob(f + ".bak.*"), "did not back up the old settings"
'

bash -n "$DIR/install.sh"

# --- install.sh
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
mkdir -p "$T/home/.claude" "$T/bin"
printf '#!/bin/sh\n' > "$T/bin/claude"; chmod +x "$T/bin/claude"
printf '%s' "$seed" > "$T/home/.claude/settings.json"
HOME="$T/home" PATH="$T/bin:$PATH" ZG_SKIP_VERIFY=1 ZG_API_KEY=sk-test123 \
  bash "$DIR/install.sh" >/dev/null
python3 -c "$assert" "$T/home/.claude/settings.json"
echo "install.sh PASS"

# --- install.ps1
if ! command -v docker >/dev/null 2>&1; then
  echo "install.ps1 SKIPPED (no docker)"
  exit 0
fi
printf '%s' "$seed" > "$T/seed.json"
docker run --rm -v "$DIR:/s:ro" -v "$T:/seed:ro" -e ZG_SKIP_VERIFY=1 -e ZG_API_KEY=sk-test123 \
  mcr.microsoft.com/powershell:latest pwsh -NoProfile -Command '
  $e = $null
  [System.Management.Automation.Language.Parser]::ParseFile("/s/install.ps1", [ref]$null, [ref]$e) | Out-Null
  if ($e) { $e | ForEach-Object { $_.ToString() }; exit 1 }
  Set-Content -Path /usr/local/bin/claude -Value "#!/bin/sh"; chmod +x /usr/local/bin/claude
  $f = Join-Path $HOME ".claude/settings.json"
  New-Item -ItemType Directory -Force -Path (Split-Path $f) | Out-Null
  Copy-Item /seed/seed.json $f
  & /s/install.ps1 | Out-Null
  $d = Get-Content $f -Raw | ConvertFrom-Json
  if ($d.env.KEEP_ME -ne "yes") { throw "clobbered an unrelated key" }
  if ($d.permissions.defaultMode -ne "auto") { throw "clobbered an unrelated section" }
  if ($d.env.ANTHROPIC_MODEL -ne "glm-5.3") { throw "did not override the model" }
  if ($d.env.ANTHROPIC_AUTH_TOKEN -ne "sk-test123") { throw "did not write the key" }
  if ($d.modelOverrides."claude-sonnet-5" -ne "0gm-1.0-35b-a3b") { throw "no modelOverrides" }
  if (-not (Get-ChildItem "$HOME/.claude/*settings.json.bak.*")) { throw "did not back up the old settings" }
  '
echo "install.ps1 PASS"
