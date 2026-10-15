import { describe, expect, it } from 'vitest'
import {
  checkContinueReadiness, checkShipReadiness, mergeSubject, nextVersion, parseShipArgs, releaseTitle,
  summarizeChecks, unreleasedBody, versionFromTitle,
} from './release-plan.mjs'

/** Facts for a release that may start: every field in its healthy state. */
const shipFacts = (changes = {}) => ({
  fetched: true,
  ghOk: true,
  branch: 'development',
  dirty: '',
  behind: 0,
  ahead: 0,
  version: '0.14.3',
  target: '0.14.4',
  mainVersion: '0.14.3',
  unreleased: { en: '### Fixed\n\n- a thing', zh: '### 修复\n\n- 一件事' },
  tagExists: false,
  openPr: null,
  toShip: 3,
  mainInDevelopment: true,
  ...changes,
})

const continueFacts = (changes = {}) => ({
  fetched: true,
  ghOk: true,
  branch: 'development',
  dirty: '',
  behind: 0,
  ahead: 0,
  openPr: { number: 55, title: 'chore(release): v0.14.4', url: 'https://example.test/pull/55' },
  ...changes,
})

describe('parseShipArgs', () => {
  it('reads a level with the default of waiting', () => {
    expect(parseShipArgs(['patch'])).toEqual({ mode: 'ship', level: 'patch', wait: true, dryRun: false })
  })

  it('reads --no-wait and --dry-run in any order', () => {
    expect(parseShipArgs(['--dry-run', 'minor', '--no-wait'])).toEqual({
      mode: 'ship', level: 'minor', wait: false, dryRun: true,
    })
  })

  it('reads --continue with --dry-run', () => {
    expect(parseShipArgs(['--continue', '--dry-run'])).toEqual({ mode: 'continue', dryRun: true })
  })

  it.each([
    [[], '要么给版本级别'],
    [['patch', 'minor'], '只能选一个'],
    [['patch', '--continue'], '不能再带版本级别'],
    [['--continue', '--no-wait'], '--no-wait'],
    [['--bump'], '不认识'],
    [['--dry-run'], '要么给版本级别'],
  ])('rejects %j', (argv, fragment) => {
    expect(parseShipArgs(argv).error).toContain(fragment)
  })
})

describe('nextVersion', () => {
  it('bumps each level and resets the lower parts', () => {
    expect(nextVersion('0.14.3', 'patch')).toBe('0.14.4')
    expect(nextVersion('0.14.3', 'minor')).toBe('0.15.0')
    expect(nextVersion('0.14.3', 'major')).toBe('1.0.0')
  })

  it('refuses a version that is not x.y.z and a level that does not exist', () => {
    expect(() => nextVersion('0.14', 'patch')).toThrow('x.y.z')
    expect(() => nextVersion('0.14.3', 'huge')).toThrow('版本级别')
  })
})

describe('unreleasedBody', () => {
  it('returns the trimmed body, empty for an empty section, null for a missing one', () => {
    expect(unreleasedBody('# Log\n\n## [Unreleased]\n\n- a\n\n## [0.1.0] - 2026-01-01\n- b\n')).toBe('- a')
    expect(unreleasedBody('# Log\n\n## [Unreleased]\n\n## [0.1.0] - 2026-01-01\n- b\n')).toBe('')
    expect(unreleasedBody('# Log\n\n## [0.1.0] - 2026-01-01\n')).toBeNull()
  })

  it('reads an Unreleased section that is the last in the file', () => {
    expect(unreleasedBody('## [Unreleased]\n- only\n')).toBe('- only')
  })
})

describe('titles', () => {
  it('builds and reads the release title, with or without the pull request number', () => {
    expect(releaseTitle('0.14.4')).toBe('chore(release): v0.14.4')
    expect(versionFromTitle('chore(release): v0.14.4')).toBe('0.14.4')
    expect(versionFromTitle('chore(release): v0.14.4 (#55)')).toBe('0.14.4')
    expect(versionFromTitle('feat: something')).toBeNull()
    expect(versionFromTitle('chore(release): v0.14')).toBeNull()
  })

  it('writes the merge subject with the pull request number', () => {
    expect(mergeSubject('0.14.4', 55)).toBe('chore(release): v0.14.4 (#55)')
  })
})

describe('summarizeChecks', () => {
  const check = (name, bucket) => ({ name, bucket, state: bucket.toUpperCase() })

  it('is none when CI has reported nothing yet, so an empty list is never "passing"', () => {
    expect(summarizeChecks([]).state).toBe('none')
    expect(summarizeChecks([check('lint', 'skipping')]).state).toBe('none')
  })

  it('passes only when every relevant check passed', () => {
    expect(summarizeChecks([check('verify', 'pass'), check('version-bump', 'pass'), check('x', 'skipping')]).state).toBe('pass')
  })

  it('is pending while anything runs, and names what', () => {
    const summary = summarizeChecks([check('verify', 'pending'), check('version-bump', 'pass')])
    expect(summary).toMatchObject({ state: 'pending', pending: ['verify'] })
  })

  it('fails on a failed or cancelled check, ahead of pending ones, and names them', () => {
    const summary = summarizeChecks([check('verify', 'fail'), check('version-bump', 'cancel'), check('x', 'pending')])
    expect(summary).toMatchObject({ state: 'fail', failing: ['verify', 'version-bump'] })
  })
})

describe('checkShipReadiness', () => {
  it('passes a healthy start with nothing to say', () => {
    expect(checkShipReadiness(shipFacts())).toEqual({ problems: [], warnings: [] })
  })

  it('names every problem at once, not just the first', () => {
    const { problems } = checkShipReadiness(
      shipFacts({ branch: 'feature/x', dirty: ' M a.ts', behind: 2, ghOk: false, tagExists: true }),
    )
    expect(problems).toHaveLength(5)
    expect(problems.join('\n')).toContain('feature/x')
    expect(problems.join('\n')).toContain('a.ts')
    expect(problems.join('\n')).toContain('落后 origin/development 2')
    expect(problems.join('\n')).toContain('gh')
    expect(problems.join('\n')).toContain('v0.14.4 已经存在')
  })

  it('reports a detached HEAD in words', () => {
    expect(checkShipReadiness(shipFacts({ branch: '' })).problems[0]).toContain('游离 HEAD')
  })

  it('blocks when either side of the changelog pair has nothing unreleased', () => {
    const emptyZh = checkShipReadiness(shipFacts({ unreleased: { en: '- a', zh: '' } })).problems
    expect(emptyZh).toHaveLength(1)
    expect(emptyZh[0]).toContain('CHANGELOG.zh.md')
    const missingEn = checkShipReadiness(shipFacts({ unreleased: { en: null, zh: '- a' } })).problems
    expect(missingEn[0]).toContain('CHANGELOG.md')
  })

  it('blocks when a release pull request is already open, pointing at --continue', () => {
    const { problems } = checkShipReadiness(shipFacts({ openPr: { number: 9, title: 't', url: 'u' } }))
    expect(problems[0]).toContain('#9')
    expect(problems[0]).toContain('--continue')
  })

  it('blocks when there is nothing to ship or the last release was never finished', () => {
    expect(checkShipReadiness(shipFacts({ toShip: 0 })).problems[0]).toContain('没有东西可发')
    expect(checkShipReadiness(shipFacts({ mainVersion: '0.14.2' })).problems[0]).toContain('没有收尾')
  })

  it('only warns when main holds commits development lacks, and when local is ahead', () => {
    const { problems, warnings } = checkShipReadiness(shipFacts({ mainInDevelopment: false, ahead: 2 }))
    expect(problems).toEqual([])
    expect(warnings).toHaveLength(2)
  })
})

describe('checkContinueReadiness', () => {
  it('passes with an open release pull request on a synced development', () => {
    expect(checkContinueReadiness(continueFacts())).toEqual({ problems: [], warnings: [] })
  })

  it('blocks without an open pull request, and says how to start one', () => {
    expect(checkContinueReadiness(continueFacts({ openPr: null })).problems[0]).toContain('npm run ship')
  })

  it('blocks a pull request whose title is not a release title', () => {
    const openPr = { number: 7, title: 'feat: add a thing', url: 'u' }
    expect(checkContinueReadiness(continueFacts({ openPr })).problems[0]).toContain('不像发版 PR')
  })

  it('blocks unpushed local commits, which would make the fast-forward sync fail after the merge', () => {
    expect(checkContinueReadiness(continueFacts({ ahead: 1 })).problems[0]).toContain('没推送')
  })

  it('shares the branch, tree and remote rules with starting', () => {
    const { problems } = checkContinueReadiness(continueFacts({ branch: 'main', dirty: '?? x', behind: 1, fetched: false }))
    expect(problems).toHaveLength(4)
  })
})
