/**
 * The pure half of `npm run ship`: argument parsing, version arithmetic, and the
 * rules that decide whether a release may start or continue.
 *
 * Everything here takes plain values and returns plain values. The script that
 * orchestrates a release gathers facts from git and gh (a branch name, a count, a
 * list of check results) and hands them in, so every rule can be tested without a
 * repository, a network or a GitHub account, which is the only way to test the rules
 * that stop a bad release.
 */

export const LEVELS = ['patch', 'minor', 'major']

export const USAGE = [
  '用法：',
  '  npm run ship -- patch|minor|major [--no-wait] [--dry-run]',
  '  npm run ship -- --continue [--dry-run]',
  '',
  '  patch|minor|major  在 development 上抬版本、跑完整 verify、推送并开往 main 的 PR',
  '  --no-wait          开完 PR 就停，不等 CI；之后用 --continue 合并',
  '  --continue         读一次 PR 的检查，全绿就合并并把 main 同步回 development',
  '  --dry-run          只打印会执行的改动型命令，不推送、不开 PR、不合并',
].join('\n')

/**
 * Turn the command line into a mode, or an error message.
 *
 * `--continue` and a bump level are different modes and never combine: a level
 * says "start a release", `--continue` says "finish the one that is open", and
 * accepting both would leave it open which one was meant.
 */
export function parseShipArgs(argv) {
  const known = new Set([...LEVELS, '--continue', '--no-wait', '--dry-run'])
  const unknown = argv.filter((argument) => !known.has(argument))
  if (unknown.length > 0) return { error: `不认识的参数：${unknown.join(' ')}` }

  const levels = argv.filter((argument) => LEVELS.includes(argument))
  const resume = argv.includes('--continue')
  const dryRun = argv.includes('--dry-run')
  const wait = !argv.includes('--no-wait')

  if (levels.length > 1) return { error: `只能选一个版本级别，给了 ${levels.join('、')}` }
  if (resume && levels.length > 0) return { error: '--continue 接着走已经开着的 PR，不能再带版本级别' }
  if (resume && !wait) return { error: '--no-wait 只用在开 PR 那一步，--continue 本来就只读一次检查' }
  if (!resume && levels.length === 0) return { error: '要么给版本级别（patch、minor、major），要么用 --continue' }

  return resume ? { mode: 'continue', dryRun } : { mode: 'ship', level: levels[0], wait, dryRun }
}

/** The version a bump produces; throws on a version that is not plain `x.y.z`. */
export function nextVersion(version, level) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`版本号不是 x.y.z：${version}`)
  const [major, minor, patch] = version.split('.').map((part) => Number.parseInt(part, 10))
  if (level === 'major') return `${major + 1}.0.0`
  if (level === 'minor') return `${major}.${minor + 1}.0`
  if (level === 'patch') return `${major}.${minor}.${patch + 1}`
  throw new Error(`没有这个版本级别：${level}`)
}

/** What sits under `## [Unreleased]`, trimmed, or `null` when the section is missing. */
export function unreleasedBody(changelog) {
  const found = /## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/.exec(changelog)
  return found === null ? null : (found[1] ?? '').trim()
}

/** The title of the release pull request and of its merge commit's subject stem. */
export function releaseTitle(version) {
  return `chore(release): v${version}`
}

/** The version a release pull request title announces, or `null` for any other title. */
export function versionFromTitle(title) {
  const found = /^chore\(release\): v(\d+\.\d+\.\d+)(?: \(#\d+\))?$/.exec(title)
  return found === null ? null : (found[1] ?? null)
}

/** The merge commit subject: the title with the pull request number, as GitHub writes it. */
export function mergeSubject(version, number) {
  return `${releaseTitle(version)} (#${number})`
}

/**
 * Collapse `gh pr checks --json name,bucket` into one state.
 *
 * `none` is its own state because a pull request opened a moment ago has no checks
 * yet, and reading that as "all passing" would merge before CI had a say. A
 * cancelled check counts as failing: it did not prove anything either.
 */
export function summarizeChecks(checks) {
  const relevant = checks.filter((check) => check.bucket !== 'skipping')
  const failing = relevant.filter((check) => check.bucket === 'fail' || check.bucket === 'cancel').map((c) => c.name)
  const pending = relevant.filter((check) => check.bucket === 'pending').map((c) => c.name)
  if (relevant.length === 0) return { state: 'none', failing, pending }
  if (failing.length > 0) return { state: 'fail', failing, pending }
  if (pending.length > 0) return { state: 'pending', failing, pending }
  return { state: 'pass', failing, pending }
}

/** The problems common to starting and finishing: tree, branch and sync with the remote. */
function baseProblems(facts) {
  const problems = []
  if (!facts.fetched) problems.push('git fetch origin 失败，没法确认本地是否落后于 origin/development')
  if (facts.branch !== 'development') {
    problems.push(`当前在 ${facts.branch === '' ? '游离 HEAD' : facts.branch}，发版只能在 development 上进行`)
  }
  if (facts.dirty !== '') {
    const lines = facts.dirty.split('\n').map((line) => `     ${line}`)
    problems.push(`工作区不干净，先提交或 stash：\n${lines.join('\n')}`)
  }
  if (facts.behind > 0) problems.push(`落后 origin/development ${facts.behind} 个提交，先 git pull --ff-only`)
  if (!facts.ghOk) problems.push('gh 没装或没登录，先 gh auth login')
  return problems
}

/** Whether `npm run ship -- <level>` may start, and what is worth a warning. */
export function checkShipReadiness(facts) {
  const problems = baseProblems(facts)
  const warnings = []
  for (const [file, body] of [['CHANGELOG.md', facts.unreleased.en], ['CHANGELOG.zh.md', facts.unreleased.zh]]) {
    if (body === null) problems.push(`${file} 里找不到 \`## [Unreleased]\` 段落`)
    else if (body === '') problems.push(`${file} 的 Unreleased 是空的，先记下这次改了什么再发版`)
  }
  if (facts.tagExists) problems.push(`标签 v${facts.target} 已经存在（本地或 origin），这一版已经发过了`)
  if (facts.openPr !== null) {
    problems.push(`已经有一个 development 到 main 的开放 PR #${facts.openPr.number}，用 npm run ship -- --continue 接着走`)
  }
  if (facts.toShip === 0) problems.push('development 相对 origin/main 没有新提交，没有东西可发')
  if (facts.version !== facts.mainVersion) {
    problems.push(`package.json 是 ${facts.version}，origin/main 是 ${facts.mainVersion}，上一次发版没有收尾`)
  }
  if (!facts.mainInDevelopment) {
    warnings.push('origin/main 有 development 没有的提交（通常是上次的合并提交），这次发完会一并同步回来')
  }
  if (facts.ahead > 0) warnings.push(`本地领先 origin/development ${facts.ahead} 个提交，会和版本提交一起推上去`)
  return { problems, warnings }
}

/** Whether `npm run ship -- --continue` may merge, ignoring the checks themselves. */
export function checkContinueReadiness(facts) {
  const problems = baseProblems(facts)
  if (facts.ahead > 0) {
    problems.push(`本地有 ${facts.ahead} 个没推送的提交，它们不在这个 PR 里，合并后快进同步会失败`)
  }
  if (facts.openPr === null) {
    problems.push('找不到 development 到 main 的开放 PR，先 npm run ship -- patch|minor|major')
  } else if (versionFromTitle(facts.openPr.title) === null) {
    problems.push(`PR #${facts.openPr.number} 的标题是「${facts.openPr.title}」，不像发版 PR（chore(release): vX.Y.Z）`)
  }
  return { problems, warnings: [] }
}
