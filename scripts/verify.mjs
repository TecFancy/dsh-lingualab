#!/usr/bin/env node
/**
 * The one gate command.
 *
 * Everything that must hold before a commit is a step in the table below, and the
 * table is the documentation: adding a check means adding a row, not editing a
 * chain of shell calls somewhere else. Two tiers exist because they answer
 * different questions.
 *
 *   · `--fast` (the pre-commit hook) — does the source still typecheck, lint, pass
 *     its tests and keep its documents consistent? Runs in a few seconds.
 *   · the full run (CI, before a release) — the same, plus the artifact checks
 *     that need a build: the two bundles parse, they register under the right id,
 *     they ask the module table only for modules the host seeds, and `lib/` is
 *     byte-identical to a fresh build of `src/`.
 *
 * A failing step prints its own output and stops the run: the first broken thing
 * is the one worth reading, and a later step's failure is usually its shadow.
 *
 * Usage:
 *   node scripts/verify.mjs           # every step
 *   node scripts/verify.mjs --fast    # the pre-commit subset
 *   node scripts/verify.mjs --list    # print the table and exit
 *   node scripts/verify.mjs --only test
 */
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const fast = argv.includes('--fast')
const onlyAt = argv.indexOf('--only')
const only = onlyAt === -1 ? null : argv[onlyAt + 1]
const list = argv.includes('--list')

/** One gate step: a name, the command, and whether the pre-commit tier runs it. */
const STEPS = [
  { name: 'typecheck', cmd: ['npm', 'run', '--silent', 'typecheck'], fast: true, about: '两个半边都过 TypeScript' },
  { name: 'lint', cmd: ['npm', 'run', '--silent', 'lint'], fast: true, about: 'ESLint，含 React hooks 规则' },
  { name: 'lint:fsd', cmd: ['npm', 'run', '--silent', 'lint:fsd'], fast: true, about: 'Steiger 的 FSD 分层规则' },
  { name: 'test', cmd: ['npm', 'run', '--silent', 'test'], fast: true, about: '单测' },
  { name: 'notes:check', cmd: ['npm', 'run', '--silent', 'notes:check'], fast: true, about: 'notes 树的形状与文件内格式' },
  { name: 'notes:links', cmd: ['npm', 'run', '--silent', 'notes:links'], fast: true, about: '笔记里的链接都落得到文件' },
  { name: 'docs:check', cmd: ['npm', 'run', '--silent', 'docs:check'], fast: true, about: 'docs 不出现孤儿文档' },
  { name: 'links:check', cmd: ['npm', 'run', '--silent', 'links:check'], fast: true, about: '全仓 markdown 相对链接有效' },
  { name: 'bilingual:check', cmd: ['npm', 'run', '--silent', 'bilingual:check'], fast: true, about: '中英对照的结构与哈希一致' },
  { name: 'zh:prose', cmd: ['npm', 'run', '--silent', 'zh:prose'], fast: true, about: '中文标点、空格与术语' },
  { name: 'skills:check', cmd: ['npm', 'run', '--silent', 'skills:check'], fast: true, about: '.claude/skills 镜像没漂移' },
  { name: 'changelog:check', cmd: ['npm', 'run', '--silent', 'changelog:check'], fast: true, about: 'CHANGELOG 与 package.json 版本一致' },
  { name: 'syntax', cmd: ['node', 'scripts/check-syntax.mjs'], fast: false, about: '两个产物都能被解析' },
  { name: 'host', cmd: ['node', 'scripts/check-host.mjs'], fast: false, about: '包名、Loader 行、路由与模块表一致' },
  { name: 'build:check', cmd: ['node', 'scripts/check-build.mjs'], fast: false, about: 'lib/ 与 src/ 的新构建逐字节一致' },
]

if (list) {
  for (const step of STEPS) {
    console.log(`${step.fast ? '快' : '全'}  ${step.name.padEnd(14)} ${step.about}`)
  }
  process.exit(0)
}

const selected = STEPS.filter((step) => (only === null ? !fast || step.fast : step.name === only))
if (selected.length === 0) {
  console.error(`没有名为 ${only} 的检查。用 --list 看全部。`)
  process.exit(2)
}

const started = Date.now()
const passed = []
const failed = []

for (const step of selected) {
  process.stdout.write(`▸ ${step.name} … `)
  const stepStart = Date.now()
  try {
    // On Windows `npm` is `npm.cmd`, which only resolves through a shell; every
    // argument here is a literal from STEPS, so nothing untrusted reaches it.
    execFileSync(step.cmd[0], step.cmd.slice(1), {
      cwd: root,
      stdio: 'pipe',
      encoding: 'utf8',
      shell: process.platform === 'win32',
    })
    const seconds = ((Date.now() - stepStart) / 1000).toFixed(1)
    console.log(`✅ ${seconds}s`)
    passed.push(step.name)
  } catch (error) {
    console.log('❌')
    // A spawn failure (ENOENT) has no stdout or stderr; its message is the only clue.
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim() || error.message
    console.error(output.split('\n').map((line) => `   ${line}`).join('\n'))
    failed.push(step.name)
    break
  }
}

const total = ((Date.now() - started) / 1000).toFixed(1)
if (failed.length > 0) {
  console.error(`\n❌ ${failed[0]} 没过（已跑 ${passed.length}/${selected.length}，用时 ${total}s）`)
  process.exit(1)
}
console.log(`\n✅ ${selected.length} 项检查全过，用时 ${total}s`)
