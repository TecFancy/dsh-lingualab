#!/usr/bin/env node
/**
 * Relative-link gate.
 *
 * Moving a file is the cheapest way to break a document set silently: the prose
 * still reads correctly and only a reader who clicks finds out. Cross-references
 * between notes are exactly the links that move, because a note changes class or
 * lifecycle without changing its subject.
 *
 * Checks every relative markdown link target in every tracked `.md` file
 * (excluding generated mirrors). Absolute URLs, anchors and mail links are left
 * alone.
 *
 * Usage: node scripts/check-links.mjs
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKIP_DIRS = new Set(['.git', 'node_modules', '.claude'])
const problems = []
let checked = 0

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full)
      continue
    }
    if (!entry.name.endsWith('.md')) continue
    const text = readFileSync(full, 'utf8')
    const rel = relative(root, full)
    let fenced = false
    text.split('\n').forEach((line, index) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
      if (fenced) return
      for (const match of line.matchAll(/\]\(([^)\s]+)\)/g)) {
        const target = match[1]
        if (/^(https?:|mailto:|#)/.test(target)) continue
        const path = target.split('#')[0]
        if (path === '') continue
        checked += 1
        if (!existsSync(resolve(root, dirname(rel), path))) {
          problems.push(`${rel}:${index + 1} → ${target}`)
        }
      }
    })
  }
}

walk(root)

if (problems.length > 0) {
  console.log(`  ❌ unresolved relative links (${problems.length}):`)
  for (const line of problems.slice(0, 12)) console.log(`     · ${line}`)
  if (problems.length > 12) console.log(`     …and ${problems.length - 12} more`)
  process.exit(1)
}
console.log(`  ✅ relative links resolve (${checked} checked)`)
