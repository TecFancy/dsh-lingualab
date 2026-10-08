#!/usr/bin/env node
/**
 * The release body: one version's section out of `CHANGELOG.md`.
 *
 * A git tag says a commit exists; a GitHub Release says what changed for whoever
 * reads it. The text is already written — every release has a dated section in the
 * changelog, put there by `npm run release` — so this script's whole job is to
 * find that section and print it, and to fail loudly when a tag has no section to
 * point at.
 *
 * Usage:
 *   node scripts/release-notes.mjs            # the version in package.json
 *   node scripts/release-notes.mjs 0.1.2      # a specific version
 *   node scripts/release-notes.mjs --write out.md
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const writeAt = argv.indexOf('--write')
const destination = writeAt === -1 ? null : argv[writeAt + 1]
const version = argv.find((argument) => /^\d+\.\d+\.\d+$/.test(argument)) ??
  JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version

const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')

/**
 * The version's section, from its heading to the next one.
 *
 * Built without the `m` flag on purpose: with it, `$` also matches at every line
 * end, and the lazy body then stops at the first newline and prints an empty
 * release. `(?:^|\n)` anchors the heading instead, and `$` means end of input.
 */
const heading = version.replace(/\./g, '\\.')
const match = new RegExp(`(?:^|\\n)## \\[${heading}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n## \\[|$)`).exec(changelog)

if (match === null) {
  console.error(`❌ CHANGELOG.md 里没有 [${version}] 这一节，先跑 npm run release -- <patch|minor|major>`)
  process.exit(1)
}

const body = [
  `## dsh-lingualab ${version}`,
  '',
  (match[1] ?? '').trim(),
  '',
  '---',
  '',
  '这个仓库不发 npm：这个版本标记的是一次装过、用过的状态，不是注册表上的一个包。',
  '装在哪个 profile：`dsh plugin --profile <名字> add -w <本仓目录>`，宿主半边改完要重启 dsh-web。',
  '',
].join('\n')

if (destination !== null && destination !== undefined) {
  writeFileSync(destination, body)
  console.log(`✅ 已写入 ${destination}（${body.length} 字节）`)
} else {
  process.stdout.write(body)
}
