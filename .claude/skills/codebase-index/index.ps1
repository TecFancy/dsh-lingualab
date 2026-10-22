# Build or refresh a codebase-memory-mcp index without any model in the loop.
# Uses the binary and the cache of the rsp-software-dev Claude Code plugin, so
# the result is the index Claude Code (and dsh with codebase-memory.yml) reads.
param(
  [string]$Path = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'

$root = Join-Path $env:LOCALAPPDATA 'RSP\codebase-memory'
$current = Join-Path $root 'current.json'
if (-not (Test-Path $current)) {
  throw "codebase-memory is not installed: $current is missing. Run /rsp-software-dev:rsp-codebase install in Claude Code."
}
$bin = (Get-Content -Raw $current | ConvertFrom-Json).binary
$repo = (Resolve-Path $Path).Path

$env:CBM_CACHE_DIR = Join-Path $root 'cache'
$env:CBM_ALLOWED_ROOT = $repo
$env:CBM_LOG_LEVEL = 'warn'

$arguments = @{ repo_path = $repo } | ConvertTo-Json -Compress
$result = & $bin cli --quiet index_repository $arguments | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw "index_repository exited with $LASTEXITCODE" }
"$($result.project): $($result.status), $($result.nodes) nodes, $($result.edges) edges"
