/**
 * The release comparison, and the states it can end in. Every case runs on a Git stub; nothing here
 * reaches a remote.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PluginVersionInfo } from '../../../../shared/protocol.ts'
import {
  compareVersions,
  createUpdateChecker,
  newestRelease,
  parseReleaseTags,
  readUpdate,
} from './update-check.ts'

const current = (patch: Partial<PluginVersionInfo> = {}): PluginVersionInfo => ({
  version: '0.17.0',
  commit: '8609774',
  dirty: false,
  ...patch,
})

/** `git ls-remote --tags` output: an annotated tag and a lightweight one. */
const TAGS = [
  '1111111111111111111111111111111111111111\trefs/tags/v0.16.0',
  '2222222222222222222222222222222222222222\trefs/tags/v0.17.0',
  '3333333333333333333333333333333333333333\trefs/tags/v0.17.0^{}',
  '4444444444444444444444444444444444444444\trefs/tags/v0.9.0',
  '5555555555555555555555555555555555555555\trefs/tags/not-a-version',
].join('\n')

const gitAnswering = (output: string | null) => () => output

describe('compareVersions', () => {
  it('compares numerically, not by string order', () => {
    expect(compareVersions('0.10.0', '0.9.0')).toBe(1)
    expect(compareVersions('0.9.0', '0.10.0')).toBe(-1)
    expect(compareVersions('0.17.0', '0.17.0')).toBe(0)
    expect(compareVersions('1.0.0', '0.99.99')).toBe(1)
  })
})

describe('parseReleaseTags', () => {
  it('keeps only vX.Y.Z tags and prefers the peeled commit', () => {
    const tags = parseReleaseTags(TAGS)
    expect(tags.map((tag) => tag.version).sort()).toEqual(['0.16.0', '0.17.0', '0.9.0'])
    expect(tags.find((tag) => tag.version === '0.17.0')?.commit).toBe(
      '3333333333333333333333333333333333333333',
    )
  })
})

describe('newestRelease', () => {
  it('picks the highest numeric tag', () => {
    expect(newestRelease(parseReleaseTags(TAGS))?.version).toBe('0.17.0')
  })

  it('answers nothing when there is no release tag', () => {
    expect(newestRelease([])).toBeNull()
  })
})

describe('readUpdate', () => {
  it('reports a newer release', () => {
    const payload = readUpdate('/repo', current({ version: '0.16.0' }), gitAnswering(TAGS))
    expect(payload.state).toBe('available')
    expect(payload.latest?.version).toBe('0.17.0')
  })

  it('reports the same release when the commit matches', () => {
    const tags = '3333333333333333333333333333333333333333\trefs/tags/v0.17.0^{}'
    const payload = readUpdate('/repo', current({ commit: '3333333' }), gitAnswering(tags))
    expect(payload.state).toBe('latest')
  })

  it('reports the same version on another commit as a development build', () => {
    const tags = '3333333333333333333333333333333333333333\trefs/tags/v0.17.0^{}'
    const payload = readUpdate('/repo', current({ commit: '9999999' }), gitAnswering(tags))
    expect(payload.state).toBe('same-version')
  })

  it('reports a running version newer than every tag', () => {
    const payload = readUpdate('/repo', current({ version: '0.18.0' }), gitAnswering(TAGS))
    expect(payload.state).toBe('ahead')
  })

  it('answers unknown, never “latest”, when Git cannot run', () => {
    const payload = readUpdate('/repo', current(), gitAnswering(null))
    expect(payload.state).toBe('unknown')
    expect(payload.reason).not.toBeNull()
  })

  it('answers unknown when the remote has no release tag', () => {
    const payload = readUpdate('/repo', current(), gitAnswering(''))
    expect(payload.state).toBe('unknown')
  })

  it('answers unknown when the running version is missing', () => {
    const payload = readUpdate('/repo', current({ version: '' }), gitAnswering(TAGS))
    expect(payload.state).toBe('unknown')
  })
})

describe('createUpdateChecker', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reuses an answer, and checks again when asked to refresh', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const git = vi.fn(gitAnswering(TAGS))
    const checker = createUpdateChecker('/repo', current({ version: '0.16.0' }), git)

    expect((await checker.check()).state).toBe('available')
    expect(git).toHaveBeenCalledTimes(1)

    vi.setSystemTime(60 * 1000)
    expect((await checker.check()).state).toBe('available')
    expect(git).toHaveBeenCalledTimes(1)

    await checker.check({ refresh: true })
    expect(git).toHaveBeenCalledTimes(2)
  })

  it('shares one run between concurrent callers', async () => {
    const git = vi.fn(gitAnswering(TAGS))
    const checker = createUpdateChecker('/repo', current({ version: '0.16.0' }), git)
    await Promise.all([checker.check(), checker.check(), checker.check()])
    expect(git).toHaveBeenCalledTimes(1)
  })
})
