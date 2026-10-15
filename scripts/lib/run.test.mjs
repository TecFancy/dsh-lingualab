import { describe, expect, it } from 'vitest'
import { createRunner, formatCommand } from './run.mjs'

describe('formatCommand', () => {
  it('leaves plain words alone and quotes the ones a shell would split', () => {
    expect(formatCommand('git', ['push', 'origin', 'development'])).toBe('git push origin development')
    expect(formatCommand('gh', ['pr', 'create', '--title', 'chore(release): v1.0.0'])).toBe(
      'gh pr create --title "chore(release): v1.0.0"',
    )
  })
})

describe('createRunner', () => {
  const lines = []
  const log = (line) => lines.push(line)

  it('prints a mutating command instead of running it under dry-run', () => {
    lines.length = 0
    const run = createRunner({ cwd: process.cwd(), dryRun: true, log })
    // If this ran, the missing program would fail the status; a dry run reports success.
    const result = run.mutate('definitely-not-a-program', ['--push'])
    expect(result).toMatchObject({ status: 0, skipped: true })
    expect(lines).toEqual(['  [dry-run] definitely-not-a-program --push'])
  })

  it('still runs read commands under dry-run', () => {
    const run = createRunner({ cwd: process.cwd(), dryRun: true, log })
    expect(run.read(process.execPath, ['-p', '1 + 1']).stdout).toBe('2')
  })

  it('reports a program that cannot start as a failed status instead of throwing', () => {
    const run = createRunner({ cwd: process.cwd(), dryRun: false, log })
    const result = run.read('definitely-not-a-program', [])
    expect(result.status).not.toBe(0)
    expect(result.stderr).not.toBe('')
  })

  it('throws from out() with the command and its stderr', () => {
    const run = createRunner({ cwd: process.cwd(), dryRun: false, log })
    expect(() => run.out(process.execPath, ['-e', 'console.error("boom"); process.exit(3)'])).toThrow(/boom/)
  })

  it('passes arguments with spaces and quotes through untouched, with no shell in between', () => {
    const run = createRunner({ cwd: process.cwd(), dryRun: false, log })
    const awkward = `a b "c" 'd' && echo x`
    expect(run.out(process.execPath, ['-p', 'process.argv[1]', awkward])).toBe(awkward)
  })
})
