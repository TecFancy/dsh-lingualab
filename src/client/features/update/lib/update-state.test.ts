/**
 * What the version line says for each answer the host can give, including the one that matters most:
 * a check that could not answer is never shown as "up to date".
 */
import { describe, expect, it } from 'vitest'
import type { PluginVersionInfo, UpdatePayload } from '../../../shared/protocol.ts'
import { updateStatus, versionLabel } from './update-state.ts'

const payload = (patch: Partial<UpdatePayload> = {}): UpdatePayload => ({
  state: 'latest',
  current: { version: '0.17.0', commit: '8609774', dirty: false },
  latest: { version: '0.17.0', commit: '3333333' },
  reason: null,
  ...patch,
})

describe('updateStatus', () => {
  it('says it is checking while the first answer is on its way', () => {
    expect(updateStatus(null, true)).toEqual({ kind: 'checking' })
  })

  it('says it cannot tell when no answer arrived', () => {
    expect(updateStatus(null, false)).toEqual({ kind: 'unknown' })
  })

  it('keeps a failed check out of the latest state', () => {
    expect(updateStatus(payload({ state: 'unknown', latest: null, reason: 'no git' }), false)).toEqual({
      kind: 'unknown',
    })
  })

  it('carries the release version when a newer one exists', () => {
    expect(updateStatus(payload({ state: 'available', latest: { version: '0.18.0', commit: '4' } }), false)).toEqual({
      kind: 'available',
      version: '0.18.0',
    })
  })

  it('reports a running build newer than every tag', () => {
    expect(updateStatus(payload({ state: 'ahead', latest: { version: '0.17.0', commit: '4' } }), false)).toEqual({
      kind: 'ahead',
      version: '0.17.0',
    })
  })

  it('reports another commit of the same version', () => {
    expect(updateStatus(payload({ state: 'same-version' }), false)).toEqual({ kind: 'same-version' })
  })

  it('reports the newest release as latest', () => {
    expect(updateStatus(payload({ state: 'latest' }), false)).toEqual({ kind: 'latest' })
  })
})

describe('versionLabel', () => {
  const info = (patch: Partial<PluginVersionInfo> = {}): PluginVersionInfo => ({
    version: '0.17.0',
    commit: '8609774',
    dirty: false,
    ...patch,
  })

  it('prints the version and the short commit', () => {
    expect(versionLabel(info())).toBe('v0.17.0 · 8609774')
  })

  it('marks uncommitted changes', () => {
    expect(versionLabel(info({ dirty: true }))).toBe('v0.17.0+ · 8609774')
  })

  it('prints only the version outside a checkout', () => {
    expect(versionLabel(info({ commit: null }))).toBe('v0.17.0')
  })

  it('prints nothing when the host did not say', () => {
    expect(versionLabel(null)).toBe('')
    expect(versionLabel(info({ version: '' }))).toBe('')
  })
})
