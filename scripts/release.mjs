#!/usr/bin/env node
/**
 * The release step, run on `development` before the pull request into `main`.
 *
 * This repository has no publish job, so "releasing" means three local facts
 * agreeing: the version in `package.json`, a dated section in `CHANGELOG.md`
 * holding what was unreleased, and a git tag on the commit that carries both.
 * This script does the first two and the commit; the tag is created after the
 * merge, when the commit that lands on `main` is known.
 *
 * The changelog is a bilingual pair, and the release body carries both sides, so
 * the move below happens in both files in one commit. Moving only the English side
 * is the mistake this shape prevents: the version heading would then exist in one
 * file, and `check-changelog` would fail on the next run instead of at release
 * time.
 *
 * Usage:
 *   node scripts/release.mjs patch|minor|major [--dry-run]
 *   node scripts/release.mjs patch --tag        # also tag the new commit
 *
 * It refuses to run on a dirty tree: a release commit that silently includes
 * unrelated edits is the failure this check exists for.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const kind = argv.find((argument) => ['patch', 'minor', 'major'].includes(argument))
const dryRun = argv.includes('--dry-run')
const tag = argv.includes('--tag')

if (kind === undefined) {
  console.error('用法：node scripts/release.mjs patch|minor|major [--dry-run] [--tag]')
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

// Moving entries between sections changes the pairing hashes, so the record has to
// be refreshed in the same commit. Without this the release commit fails its own
// pre-commit gate, which is how this step was found.
try {
  execFileSync('node', ['scripts/check-bilingual.mjs', '--write'], { cwd: root, stdio: 'pipe' })
  console.log('  bilingual：配对记录已按新分节重记')
} catch {
  console.error('⚠️ 配对记录没能重记，提交前自己跑一次 npm run bilingual:check -- --write')
}

git('add', 'package.json', ...CHANGELOGS)
git('add', ...CHANGELOGS.map((file) => file.replace(/\.md$/, '.i18n.yaml')))
git('commit', '-m', `chore(release): v${next}`)
console.log(`✅ 已提交 chore(release): v${next}`)

if (tag) {
  git('tag', '-a', `v${next}`, '-m', `v${next}`)
  console.log(`✅ 已打标签 v${next}`)
}

console.log(`
下一步：
  1. git push origin development          # 推上去，开 PR 到 main
  2. PR 合进 main 之后：git checkout main && git pull
  3. git tag -a v${next} -m "v${next}" && git push origin v${next}${tag ? '（已打，跳过）' : ''}
`)
