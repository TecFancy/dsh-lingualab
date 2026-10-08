#!/usr/bin/env node
/**
 * The changelog invariant.
 *
 * A changelog drifts in one direction: the version in `package.json` moves and
 * the file does not, or the other way round. Both are invisible in review and
 * both make the next release a guess, so the rule is checked instead of trusted.
 *
 * Two things must hold:
 *
 *   1. `## [Unreleased]` exists at the top, so work in progress has somewhere to
 *      go that is not a release heading.
 *   2. The first released heading equals `package.json#version` — the same string,
 *      not a "close enough" one.
 *
 * It also refuses an empty release section. The changelog is what the GitHub
 * Release body is built from (`scripts/release-notes.mjs`), so a version heading
 * with nothing under it publishes a release that says nothing.
 *
 * The changelog is a bilingual pair (`CHANGELOG.md` / `CHANGELOG.zh.md`), and the
 * release body carries both sides, so every rule below runs over both files. A
 * version that exists only in English would publish a release whose Chinese half is
 * silently missing.
 *
 * Usage: node scripts/check-changelog.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const problems = []

/** The two sides of the pair the release body is built from. */
const FILES = ['CHANGELOG.md', 'CHANGELOG.zh.md']

for (const file of FILES) {
  const changelog = readFileSync(join(root, file), 'utf8')
  const headings = [...changelog.matchAll(/^## \[([^\]]+)\]/gm)].map((match) => match[1])
  if (headings.length === 0) {
    problems.push(`${file} 里没有任何 \`## [x.y.z]\` 标题`)
    continue
  }
  if (headings[0] !== 'Unreleased') {
    problems.push(`${file} 的第一个标题是 [${headings[0]}]，应该是 [Unreleased]`)
  }
  const released = headings.filter((heading) => heading !== 'Unreleased')
  if (released[0] !== manifest.version) {
    problems.push(
      `${file} 最新的发行版是 [${released[0] ?? '（无）'}]，package.json 是 ${manifest.version}；` +
        '两者必须一致，改版本用 `npm run release -- <patch|minor|major>`',
    )
  }

  const section = new RegExp(`(?:^|\\n)## \\[${manifest.version.replace(/\./g, '\\.')}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n## \\[|$)`).exec(
    changelog,
  )
  const detail = (section?.[1] ?? '')
    .split('\n')
    .filter((line) => line.trim().length > 0 && !line.trim().startsWith('###'))
    .length
  if (detail === 0) {
    problems.push(`${file} 的 [${manifest.version}] 这一节是空的：Release 正文从这里生成，别发一条什么都没说的版本`)
  }
}

if (problems.length > 0) {
  console.error('❌ check-changelog：')
  for (const problem of problems) console.error(`   · ${problem}`)
  process.exit(1)
}
console.log(`✅ check-changelog — 中英两侧都是 Unreleased 在最上，最新发行版 ${manifest.version} 与 package.json 一致`)
