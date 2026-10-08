#!/usr/bin/env node
/**
 * Build-freshness gate: what `src/` builds must be what `lib/` ships.
 *
 * `lib/` is committed because the profile installs this package as a `link:`
 * dependency and the shell fetches `lib/client.js` straight off disk. A stale
 * artifact is therefore invisible: the repository shows the new source, the
 * running page shows the old code, and every other gate passes on both.
 *
 * The check rebuilds into a temporary directory and compares bytes. It catches
 * both directions — editing `src/` without rebuilding, and hand-editing `lib/`.
 * tsdown output is deterministic, so a byte comparison is safe.
 *
 * Usage: node scripts/check-build.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Artifacts the build owns, by name under `lib/`. */
const TRACKED = ['index.js', 'client.js']

const tsdown = join(root, 'node_modules', '.bin', 'tsdown')
const out = mkdtempSync(join(tmpdir(), 'dsh-lingualab-build-'))

try {
  try {
    execFileSync(tsdown, ['--out-dir', out], { cwd: root, stdio: 'pipe' })
  } catch (error) {
    const detail = String(error.stderr ?? error.stdout ?? error.message).trim().split('\n').slice(-3).join(' ')
    console.error(`❌ build:check — the build failed, so lib/ cannot be trusted: ${detail}`)
    process.exit(1)
  }

  const drifted = []
  for (const file of TRACKED) {
    const fresh = readFileSync(join(out, file))
    const committed = readFileSync(join(root, 'lib', file))
    if (!fresh.equals(committed)) drifted.push(`lib/${file}`)
  }

  if (drifted.length > 0) {
    console.error(`❌ build:check — ${drifted.join(', ')} differs from a fresh build of src/.`)
    console.error('   Run `npm run build` and commit the result together with the source change.')
    process.exit(1)
  }
  console.log(`✅ build:check — lib/ matches a fresh build of src/ (${TRACKED.join(', ')})`)
} finally {
  rmSync(out, { recursive: true, force: true })
}
