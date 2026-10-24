/**
 * The version the host half reports, read without touching a real manifest or a real checkout.
 */
import { describe, expect, it } from 'vitest'
import { readPluginInfo } from './plugin-info.ts'

/** A Git stub: the commit for `rev-parse`, the porcelain output for `status`. */
function gitStub(commit: string | null, status: string | null) {
  return (args: readonly string[]): string | null => {
    if (args[0] === 'rev-parse') return commit
    if (args[0] === 'status') return status
    return null
  }
}

describe('readPluginInfo', () => {
  it('reads the manifest version and the short commit', () => {
    const info = readPluginInfo('/repo', {
      readFile: () => JSON.stringify({ version: '0.17.0' }),
      git: gitStub('8609774\n', ''),
    })
    expect(info).toEqual({ version: '0.17.0', commit: '8609774', dirty: false })
  })

  it('marks a checkout with uncommitted changes', () => {
    const info = readPluginInfo('/repo', {
      readFile: () => JSON.stringify({ version: '0.17.0' }),
      git: gitStub('8609774', ' M src/index.ts\n'),
    })
    expect(info.dirty).toBe(true)
  })

  it('answers empty and null when the manifest and Git are unavailable', () => {
    const info = readPluginInfo('/repo', {
      readFile: () => {
        throw new Error('missing')
      },
      git: () => null,
    })
    expect(info).toEqual({ version: '', commit: null, dirty: false })
  })

  it('treats a manifest without a version as unknown rather than inventing one', () => {
    const info = readPluginInfo('/repo', { readFile: () => '{}', git: gitStub(null, '') })
    expect(info.version).toBe('')
  })
})
