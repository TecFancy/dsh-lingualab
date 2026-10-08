#!/usr/bin/env node
/**
 * Docs link-graph gate.
 *
 * There is no `INDEX.md` in this repo: the filesystem tree plus the link graph
 * from the READMEs is the index. This gate keeps that true:
 *
 *   1. every `docs/*.md` is reachable from a README (no orphan documents);
 *   2. no `INDEX.md` exists under `docs/` (the map is the tree, not a file);
 *   3. every doc opens with exactly one `# ` H1.
 *
 * Usage: node scripts/check-docs.mjs
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(root, 'docs')
const READMES = ['README.md', 'README.zh.md']
const problems = []

if (!existsSync(DOCS)) {
  console.log('  ⏭️  no docs/ directory yet — nothing to check')
  process.exit(0)
}

/** Every `.md` under `docs/`, at any depth — a nested document is still a document. */
const docs = []
const collect = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) collect(join(dir, entry.name))
    else if (entry.isFile() && entry.name.endsWith('.md')) docs.push(relative(DOCS, join(dir, entry.name)))
  }
}
collect(DOCS)
docs.sort()

if (docs.some((file) => file.endsWith('INDEX.md'))) problems.push('an INDEX.md exists under docs/; the tree plus README links is the index')

const readmeText = READMES
  .filter((name) => existsSync(join(root, name)))
  .map((name) => readFileSync(join(root, name), 'utf8'))
  .join('\n')

for (const file of docs) {
  const body = readFileSync(join(DOCS, file), 'utf8')
  // Count H1 lines outside fenced code blocks: a shell comment inside a ```bash
  // block also starts with "# " and is not a heading.
  let fenced = false
  let h1 = 0
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
    else if (!fenced && /^# \S/.test(line)) h1 += 1
  }
  if (h1 !== 1) problems.push(`docs/${file}: expected exactly one '# ' H1 outside code fences, found ${h1}`)
  if (!readmeText.includes(`docs/${file}`)) {
    problems.push(`docs/${file}: not linked from ${READMES.join(' or ')} (orphan document)`)
  }
}

if (problems.length > 0) {
  console.log('  ❌ docs link graph:')
  for (const line of problems) console.log(`     · ${line}`)
  process.exit(1)
}
console.log(`  ✅ docs link graph (${docs.length} doc(s), all reachable from a README, no INDEX.md)`)
