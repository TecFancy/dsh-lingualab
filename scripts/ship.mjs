#!/usr/bin/env node
/**
 * Ship a release from `development` to `main` with one command.
 *
 *   npm run ship -- patch|minor|major [--no-wait] [--dry-run]
 *   npm run ship -- --continue [--dry-run]
 *
 * Running `ship` with a level IS the release decision. It checks the ground, bumps
 * the version and the changelog pair (`scripts/release.mjs`), runs the full verify,
 * pushes `development`, opens the pull request into `main`, watches its checks and,
 * when they are green, merges with a merge commit and fast-forwards `development`
 * onto the merged `main`. Deploying is `npm run deploy`. The tag and the GitHub
 * Release come from `.github/workflows/release.yml` when `main` receives the merge,
 * which is why nothing here creates a tag.
 *
 * `--no-wait` is the two-step form for a caller that must not sit and poll CI (an
 * agent, say): it stops after opening the pull request, and `--continue` later reads
 * the checks once, without polling, and does the merge and the sync back. It exits 3
 * while checks are pending and 1 when one failed, so it can simply be run again.
 *
 * There is no release branch and no pull request into `development`: a push to
 * `development` already runs the full verify in CI, and the pull request into
 * `main` is where the `version-bump` job guards the bump. State is read from git and
 * gh every time, never kept in a file.
 *
 * `--dry-run` runs every check for real (they only read) and prints each command
 * that would change something instead of running it. Failed checks are reported but
 * do not stop a dry run, so the plan can be inspected from any branch.
 */
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { gatherContinueFacts, gatherShipFacts, readChecks } from './lib/release-facts.mjs'
import {
  USAGE, checkContinueReadiness, checkShipReadiness, mergeSubject, nextVersion, parseShipArgs, releaseTitle,
  summarizeChecks, versionFromTitle,
} from './lib/release-plan.mjs'
import { createRunner } from './lib/run.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = parseShipArgs(process.argv.slice(2))
if (args.error !== undefined) {
  console.error(`❌ ${args.error}\n\n${USAGE}`)
  process.exit(2)
}
const run = createRunner({ cwd: root, dryRun: args.dryRun })
const say = run.log

/** Stop with a message. `hint` is printed after it, for the state a stop leaves behind. */
function fail(message, hint = '', code = 1) {
  console.error(`❌ ${message}`)
  if (hint !== '') console.error(hint)
  process.exit(code)
}

/** Print the verdict of a readiness check; stop on problems unless this is a dry run. */
function judge({ problems, warnings }) {
  for (const warning of warnings) say(`⚠️  ${warning}`)
  if (problems.length === 0) return say('✅ 检查通过')
  for (const problem of problems) console.error(`❌ ${problem}`)
  if (!args.dryRun) process.exit(1)
  say('（--dry-run）上面的问题在真实运行时会在这里停下，这里继续演示计划')
}

/** Run a mutating command and stop on a non-zero status. */
function must(command, commandArgs, hint, options) {
  const result = run.mutate(command, commandArgs, options)
  if (result.status !== 0) fail(`${command} ${commandArgs[0] ?? ''} 失败（${result.status}）${result.stderr}`, hint)
  return result
}

/** Wait until CI has registered at least one check; a PR opened a moment ago has none. */
async function waitForChecksToAppear(number) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (readChecks(run, number).length > 0) return true
    await sleep(5000)
  }
  return false
}

async function startRelease() {
  const target = nextVersion(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version, args.level)
  say(`发版：${args.level} → v${target}${args.dryRun ? '（--dry-run）' : ''}\n`)
  say('1. 检查')
  const facts = gatherShipFacts(run, root, target)
  say(`  分支 ${facts.branch || '（游离）'}，origin/main 是 ${facts.mainVersion}，要发的提交 ${facts.toShip} 个`)
  judge(checkShipReadiness(facts))

  const undo = '本地 development 可能已有版本提交；放弃它：git reset --hard origin/development，然后重来'
  say('\n2. 抬版本并验证')
  must('node', ['scripts/release.mjs', args.level], undo)
  if (!run.dryRun) {
    const written = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
    if (written !== target) fail(`release.mjs 写出的版本是 ${written}，预期 ${target}`, undo)
  }
  must('node', ['scripts/verify.mjs'], `修好之后：node scripts/verify.mjs && git push origin development，再手动开 PR；或者 ${undo}`)
  must('git', ['push', 'origin', 'development'], '推送失败，网络恢复后重跑 git push origin development，再手动开 PR')

  say('\n3. 开 PR')
  const body = run.dryRun ? '<tmp>/pr-body.md' : join(mkdtempSync(join(tmpdir(), 'lingualab-ship-')), 'pr-body.md')
  must('node', ['scripts/release-notes.mjs', target, '--write', body], '没法生成 PR 正文：检查两侧 CHANGELOG 里有没有这一版')
  const created = must(
    'gh',
    ['pr', 'create', '--base', 'main', '--head', 'development', '--title', releaseTitle(target), '--body-file', body],
    '版本提交已经推上去了，手动开 PR：gh pr create --base main --head development',
    { capture: true },
  )
  const url = created.stdout.split('\n').pop() ?? ''
  const number = run.dryRun ? '<PR>' : url.split('/').pop()
  say(`  PR：${run.dryRun ? '（--dry-run）' : url}`)

  say('\n4. 等检查')
  if (!args.wait) return say('  --no-wait：到此为止。CI 跑完后：npm run ship -- --continue（只读一次检查，还在跑会退出码 3，等等再来）')
  if (!run.dryRun && !(await waitForChecksToAppear(number))) {
    fail('一分钟了 CI 还没有出检查', `看一眼 ${url}，有了之后：npm run ship -- --continue`)
  }
  const watched = run.mutate('gh', ['pr', 'checks', String(number), '--watch', '--fail-fast'])
  if (watched.status !== 0) fail('PR 的检查没有全过', `看 ${url}，修好后推到 development，全绿后：npm run ship -- --continue`)
  say('\n✅ 检查全绿')
  if (!run.dryRun) judge(checkContinueReadiness(gatherContinueFacts(run, root)))
  mergeAndSync(number, target)
}

function reportChecks(number) {
  const summary = summarizeChecks(readChecks(run, number))
  if (summary.state === 'pass') return say('✅ PR 的检查全绿')
  const detail = { none: 'CI 还没有出检查', pending: `还在跑：${summary.pending.join('、')}`, fail: `没过：${summary.failing.join('、')}` }
  console.error(`${summary.state === 'fail' ? '❌' : '⏳'} ${detail[summary.state]}`)
  if (args.dryRun) return say('（--dry-run）真实运行时会在这里停下，这里继续演示计划')
  if (summary.state === 'fail') process.exit(1)
  console.error('等它跑完再运行 npm run ship -- --continue')
  process.exit(3)
}

/** Merge the pull request with a merge commit, then fast-forward development onto main. */
function mergeAndSync(number, version) {
  say('\n5. 合并')
  const merge = must(
    'gh', ['pr', 'merge', String(number), '--merge', '--subject', mergeSubject(version, number)],
    `合并没成功，看 PR 页面；成功后用 git fetch origin && git merge --ff-only origin/main && git push origin development 同步`,
  )

  say('\n6. 把 main 同步回 development')
  const sync = '合并已经完成。排查后手动：git fetch origin && git merge --ff-only origin/main && git push origin development'
  must('git', ['fetch', 'origin'], sync)
  must('git', ['merge', '--ff-only', 'origin/main'], sync)
  must('git', ['push', 'origin', 'development'], sync)
  if (!merge.skipped) {
    const landed = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
    if (landed !== version) say(`⚠️  同步后 package.json 是 ${landed}，PR 标题是 v${version}`)
  }
  say(`\n✅ v${version} 已合并进 main。.github/workflows/release.yml 会在 main 收到合并后建标签和 GitHub Release。`)
  say('下一步：npm run deploy（需要 LINGUALAB_DEPLOY_HOST 与 LINGUALAB_DEPLOY_PATH，见技能「发版与 Release」）')
}

/** `--continue`: finish the release a `--no-wait` run opened. */
function finishRelease() {
  say(`收尾${args.dryRun ? '（--dry-run）' : ''}\n`)
  say('1. 检查')
  const facts = gatherContinueFacts(run, root)
  judge(checkContinueReadiness(facts))
  const pr = facts.openPr
  const number = pr === null ? '<PR>' : pr.number
  const version = pr === null ? 'X.Y.Z' : (versionFromTitle(pr.title) ?? 'X.Y.Z')
  if (pr !== null) say(`  PR #${pr.number}：${pr.title}\n  ${pr.url}`)
  if (pr !== null) reportChecks(pr.number)
  mergeAndSync(number, version)
}

if (args.mode === 'ship') await startRelease()
else finishRelease()
