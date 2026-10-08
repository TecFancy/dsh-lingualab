#!/usr/bin/env node
/**
 * The pull-request-into-`main` guard: this branch must raise the version.
 *
 * "Releases happen by pulling into `main`" is only true if the pull request
 * actually carries the bump. Forgetting it is easy — the code is what the author
 * was thinking about — and the mistake surfaces much later, when two merges land
 * under one version number and the tags stop meaning anything.
 *
 * CI runs this with `BASE_REF` set to the base branch (`origin/main`). Locally it
 * defaults to `main`, so `npm run release:check` answers the same question before
 * pushing.
 *
 * Usage:
 *   node scripts/check-version-bump.mjs                  # against main
 *   BASE_REF=origin/main node scripts/check-version-bump.mjs
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = process.env.BASE_REF ?? 'main'

/** Read the manifest as it exists on another ref. */
function versionAt(ref) {
  const raw = execFileSync('git', ['show', `${ref}:package.json`], { cwd: root, encoding: 'utf8' })
  return JSON.parse(raw).version
}

/** Compare two `x.y.z` strings; returns a negative number when `left` is older. */
function compare(left, right) {
  const parts = (value) => value.split('.').map((part) => Number.parseInt(part, 10))
  const [a = [], b = []] = [parts(left), parts(right)]
  for (let index = 0; index < 3; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0)
    if (difference !== 0) return difference
  }
  return 0
}

const current = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
let baseVersion
try {
  baseVersion = versionAt(base)
} catch {
  console.log(`✅ check-version-bump — 找不到 ${base}，可能是首次推送，跳过`)
  process.exit(0)
}

if (compare(current, baseVersion) <= 0) {
  console.error(
    `❌ 这个分支的版本是 ${current}，${base} 上已经是 ${baseVersion}；` +
      '合进 main 前先跑 `npm run release -- patch|minor|major`，把版本与 CHANGELOG 一起带上',
  )
  process.exit(1)
}

console.log(`✅ check-version-bump — ${baseVersion} → ${current}`)
