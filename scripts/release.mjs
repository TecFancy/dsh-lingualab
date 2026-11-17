#!/usr/bin/env node
/**
 * The bump step of a release, run on `development` before the pull request into `main`.
 *
 * This repository has no publish job, so "releasing" means three facts agreeing: the
 * version in `package.json`, a dated section in `CHANGELOG.md` holding what was
 * unreleased, and a git tag on the commit that carries both. This script does the
 * first two and the commit. It never tags: the tag is created by
 * `.github/workflows/release.yml` when the merge lands on `main`.
 *
 * Normally it is not run by hand: `npm run ship -- patch|minor|major` runs it, then
 * the full verify, the push and the pull request. It stays a separate script so the
 * bump logic exists once.
 *
 * The changelog is a bilingual pair, and the release body carries both sides, so
 * the move below happens in both files in one commit. Moving only the English side
 * is the mistake this shape prevents: the version heading would then exist in one
 * file, and `check-changelog` would fail on the next run instead of at release
 * time.
 *
 * Usage:
 *   node scripts/release.mjs patch|minor|major [--dry-run]
 *
 * It refuses to run on a dirty tree: a release commit that silently includes
 * unrelated edits is the failure this check exists for.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const kind = argv.find((argument) => ['patch', 'minor', 'major'].includes(argument))
const dryRun = argv.includes('--dry-run')

if (kind === undefined) {
  console.error('用法：node scripts/release.mjs patch|minor|major [--dry-run]')
  process.exit(2)
}

/** Run a git command in the repository and return its trimmed stdout. */
function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
}

const dirty = git('status', '--porcelain')
if (dirty.length > 0 && !dryRun) {
  console.error('❌ 工作区不干净，先提交或 stash：')
  console.error(dirty.split('\n').map((line) => `   ${line}`).join('\n'))
  process.exit(1)
}

const manifestPath = join(root, 'package.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

/** Both sides of the changelog pair, in the order the release body shows them. */
const CHANGELOGS = ['CHANGELOG.md', 'CHANGELOG.zh.md']

const [major = 0, minor = 0, patch = 0] = String(manifest.version)
  .split('.')
  .map((part) => Number.parseInt(part, 10))
const next =
  kind === 'major' ? `${major + 1}.0.0` : kind === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`

const today = new Date().toISOString().slice(0, 10)
const nextChangelogs = new Map()

for (const file of CHANGELOGS) {
  const changelog = readFileSync(join(root, file), 'utf8')
  const unreleased = /## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/.exec(changelog)
  if (unreleased === null) {
    console.error(`❌ ${file} 里找不到 \`## [Unreleased]\` 段落`)
    process.exit(1)
  }
  const body = (unreleased[1] ?? '').trim()
  if (body.length === 0) {
    console.error(`❌ ${file} 的 Unreleased 是空的：先在它下面记下这次改了什么，再发版`)
    process.exit(1)
  }
  nextChangelogs.set(
    file,
    changelog.replace(
      /## \[Unreleased\]\n[\s\S]*?(?=\n## \[|$)/,
      `## [Unreleased]\n\n## [${next}] - ${today}\n\n${body}\n`,
    ),
  )
}
const nextManifest = { ...manifest, version: next }

console.log(`${manifest.version} → ${next}（${kind}）`)
console.log(`  CHANGELOG：把中英两侧的 Unreleased 都挪到 [${next}] - ${today}`)
for (const [file, text] of nextChangelogs) {
  if (text === readFileSync(join(root, file), 'utf8')) {
    console.error(`❌ ${file} 没有变化，检查 Unreleased 段落是否写成了别的形状`)
    process.exit(1)
  }
}

if (dryRun) {
  console.log('（--dry-run，不写文件、不提交）')
  process.exit(0)
}

writeFileSync(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`)
for (const [file, text] of nextChangelogs) writeFileSync(join(root, file), text)

// The lockfile carries the same version in two places, and npm refuses to publish a
// tree whose lockfile disagrees with the manifest. Bumping only package.json left the
// lockfile at 0.14.5 for seven releases, so the sync is part of the bump now.
const lockPath = join(root, 'package-lock.json')
if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
  lock.version = next
  if (lock.packages?.[''] !== undefined) lock.packages[''].version = next
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
  console.log(`  lockfile：版本同步到 ${next}`)
}

// Moving entries between sections changes the pairing hashes, so the record has to
// be refreshed in the same commit. Without this the release commit fails its own
// pre-commit gate, which is how this step was found.
try {
  execFileSync('node', ['scripts/check-bilingual.mjs', '--write'], { cwd: root, stdio: 'pipe' })
  console.log('  bilingual：配对记录已按新分节重记')
} catch {
  console.error('⚠️ 配对记录没能重记，提交前自己跑一次 npm run bilingual:check -- --write')
}

git('add', 'package.json', 'package-lock.json', ...CHANGELOGS)
// One sidecar records the whole pair, so it is named after the English side — not
// one per file, which is what staging every derived name got wrong.
const sidecar = CHANGELOGS[0]?.replace(/\.md$/, '.i18n.yaml')
if (sidecar !== undefined && existsSync(join(root, sidecar))) git('add', sidecar)
git('commit', '-m', `chore(release): v${next}`)
console.log(`✅ 已提交 chore(release): v${next}`)

console.log('标签不在本地打：PR 合进 main 后，release.yml 建标签和 GitHub Release。完整流程用 npm run ship。')
