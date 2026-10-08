#!/usr/bin/env node
/**
 * Mirror `.agents/skills/` into `.claude/skills/`.
 *
 * `.agents/skills/` is the single source: dsh discovers it natively
 * (`dsh-skill-filesystem`, root rank 200, watched), and Claude Code reads
 * `.claude/skills/`. The mirror is generated, never hand-edited — `--check`
 * fails when it drifts, and that is what `npm run verify` runs.
 *
 * Usage:
 *   node scripts/sync-skills.mjs           # write the mirror
 *   node scripts/sync-skills.mjs --check   # exit 1 if the mirror differs
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(root, '.agents/skills')
const MIRROR = join(root, '.claude/skills')
const check = process.argv.includes('--check')

/** Relative path -> file body, for every file under `dir` (empty when absent). */
function snapshot(dir) {
  const files = new Map()
  if (!existsSync(dir)) return files
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.isFile()) files.set(relative(dir, full), readFileSync(full))
    }
  }
  walk(dir)
  return files
}

if (!existsSync(SOURCE)) {
  console.error('❌ .agents/skills/ is missing; nothing to mirror')
  process.exit(1)
}

const source = snapshot(SOURCE)
const mirror = snapshot(MIRROR)
const differences = []

for (const [file, body] of source) {
  const other = mirror.get(file)
  if (other === undefined) differences.push(`missing in .claude/skills: ${file}`)
  else if (!other.equals(body)) differences.push(`differs from .agents/skills: ${file}`)
}
for (const file of mirror.keys()) {
  if (!source.has(file)) differences.push(`stale in .claude/skills: ${file}`)
}

if (check) {
  if (differences.length === 0) {
    console.log(`  ✅ .claude/skills mirror is current (${source.size} file(s))`)
    process.exit(0)
  }
  console.log('  ❌ .claude/skills is out of sync with .agents/skills (single source):')
  for (const line of differences) console.log(`     · ${line}`)
  console.log('     fix: npm run skills:sync')
  process.exit(1)
}

rmSync(MIRROR, { recursive: true, force: true })
mkdirSync(MIRROR, { recursive: true })
for (const skill of readdirSync(SOURCE, { withFileTypes: true })) {
  if (!skill.isDirectory()) continue
  const from = join(SOURCE, skill.name)
  if (!statSync(from).isDirectory()) continue
  cpSync(from, join(MIRROR, skill.name), { recursive: true })
}
console.log(`✅ mirrored ${readdirSync(MIRROR).length} skill(s) .agents/skills → .claude/skills`)
