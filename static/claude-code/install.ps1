# One-click: install Claude Code and point it at the 0G Compute Router.
#   irm https://docs.0g.ai/claude-code/install.ps1 | iex
# Non-interactive: set $env:ZG_API_KEY first.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$BaseUrl     = if ($env:ZG_BASE_URL)   { $env:ZG_BASE_URL }   else { 'https://router-api.0g.ai' }
$Model       = if ($env:ZG_MODEL)      { $env:ZG_MODEL }      else { 'glm-5.3' }
$SmallModel  = if ($env:ZG_SMALL_MODEL){ $env:ZG_SMALL_MODEL }else { '0gm-1.0-35b-a3b' }
$MaxContext  = if ($env:ZG_MAX_CONTEXT_TOKENS) { $env:ZG_MAX_CONTEXT_TOKENS } else { '983616' }
$Key         = $env:ZG_API_KEY
$Settings    = Join-Path $HOME '.claude\settings.json'

function Say  ($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Die  ($m) { Write-Host "Error: $m" -ForegroundColor Red; exit 1 }

# 1. Claude Code itself
if (Get-Command claude -ErrorAction SilentlyContinue) {
  Say "Claude Code already installed."
} else {
  Say "Installing Claude Code..."
  & ([scriptblock]::Create((Invoke-RestMethod 'https://claude.ai/install.ps1')))
  $env:PATH = "$HOME\.local\bin;$env:PATH"
  if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Die "Claude Code installed but 'claude' is not on PATH. Open a new terminal and re-run."
  }
}

# 2. API key
if (-not $Key) {
  $Key = Read-Host 'Paste your 0G Router API key (https://pc.0g.ai -> API Keys)'
}
if (-not $Key) { Die 'No API key given.' }

# 3. Verify the key end-to-end with a 1-token request
if ($env:ZG_SKIP_VERIFY) { Say 'Skipping key verification.' } else {
Say "Verifying key against $BaseUrl ..."
$body = @{ model = $Model; max_tokens = 1; messages = @(@{ role = 'user'; content = 'hi' }) } | ConvertTo-Json -Depth 5
try {
  Invoke-WebRequest -Uri "$BaseUrl/v1/messages" -Method Post -UseBasicParsing `
    -Headers @{ Authorization = "Bearer $Key" } -ContentType 'application/json' -Body $body | Out-Null
  Say 'Key OK.'
} catch {
  $code = 0
  if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
  switch ($code) {
    { $_ -in 401, 403 } { Die "Key rejected ($code). Check the key at https://pc.0g.ai -> API Keys." }
    402 { Die 'Key is valid but the account has no balance. Top up at https://pc.0g.ai.' }
    0   { Die "Cannot reach $BaseUrl. $($_.Exception.Message)" }
    default { Write-Host "Warning: verification returned HTTP $code; writing config anyway." -ForegroundColor Yellow }
  }
}
}

# 4. Merge into %USERPROFILE%\.claude\settings.json (never clobber an existing config)
function ConvertTo-Hashtable ($obj) {
  if ($obj -is [System.Management.Automation.PSCustomObject]) {
    $h = [ordered]@{}
    foreach ($p in $obj.PSObject.Properties) { $h[$p.Name] = ConvertTo-Hashtable $p.Value }
    return $h
  }
  return $obj
}

$new = @{
  env = [ordered]@{
    ANTHROPIC_BASE_URL             = $BaseUrl
    ANTHROPIC_AUTH_TOKEN           = $Key
    ANTHROPIC_API_KEY              = ''
    ANTHROPIC_MODEL                = $Model
    ANTHROPIC_DEFAULT_FABLE_MODEL  = $Model
    ANTHROPIC_DEFAULT_OPUS_MODEL   = $Model
    ANTHROPIC_DEFAULT_HAIKU_MODEL  = $SmallModel
    CLAUDE_CODE_MAX_CONTEXT_TOKENS = $MaxContext
  }
  modelOverrides = [ordered]@{ 'claude-sonnet-5' = $SmallModel }
}

New-Item -ItemType Directory -Force -Path (Split-Path $Settings) | Out-Null
$cur = [ordered]@{}
if ((Test-Path $Settings) -and (Get-Item $Settings).Length -gt 0) {
  $backup = "$Settings.bak.$(Get-Date -Format yyyyMMddHHmmss)"
  Copy-Item $Settings $backup
  Say "Existing settings backed up to $backup"
  try { $cur = ConvertTo-Hashtable (Get-Content $Settings -Raw | ConvertFrom-Json) }
  catch { Die "$Settings is not valid JSON. Your config is untouched (backup: $backup)." }
}
foreach ($section in $new.Keys) {
  if (-not ($cur[$section] -is [System.Collections.IDictionary])) { $cur[$section] = [ordered]@{} }
  foreach ($k in $new[$section].Keys) { $cur[$section][$k] = $new[$section][$k] }
}
[System.IO.File]::WriteAllText($Settings, (($cur | ConvertTo-Json -Depth 10) + "`n"), (New-Object System.Text.UTF8Encoding $false))

Say 'Done. Start with:  claude --permission-mode auto'
