// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS, SETTINGS_KEY, parseSettings, readSettings, useSettings } from './store.ts'

describe('parseSettings', () => {
  it('is the defaults when nothing is stored', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
  })

  it('is the defaults for text that is not JSON, or JSON that is not an object', () => {
    expect(parseSettings('{oops')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('null')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('7')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('[]')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('"ink"')).toEqual(DEFAULT_SETTINGS)
  })

  it('reads a complete, valid record back', () => {
    expect(parseSettings('{"theme":"paper","appearance":"dark","stageSize":"l"}')).toEqual({
      theme: 'paper',
      appearance: 'dark',
      stageSize: 'l',
    })
  })

  it('falls back field by field, keeping the valid ones', () => {
    expect(parseSettings('{"theme":"neon","appearance":"light","stageSize":"xl"}')).toEqual({
      theme: 'dsh',
      appearance: 'light',
      stageSize: 'm',
    })
    expect(parseSettings('{"theme":"dusk","appearance":3}')).toEqual({ theme: 'dusk', appearance: 'auto', stageSize: 'm' })
  })

  it('ignores keys it does not know', () => {
    expect(parseSettings('{"theme":"pine","size":"s"}')).toEqual({ ...DEFAULT_SETTINGS, theme: 'pine' })
  })
})

/** The few `localStorage` members the module uses, over a plain map. */
function installStorage(): Map<string, string> {
  const data = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  })
  return data
}

describe('the store', () => {
  let data: Map<string, string>

  beforeEach(() => {
    data = installStorage()
    useSettings.setState(DEFAULT_SETTINGS)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('remembers each change under one key', () => {
    useSettings.getState().setTheme('ink')
    useSettings.getState().setAppearance('dark')
    useSettings.getState().setStageSize('s')
    expect(JSON.parse(data.get(SETTINGS_KEY) ?? 'null')).toEqual({ theme: 'ink', appearance: 'dark', stageSize: 's' })
    expect(readSettings()).toEqual({ theme: 'ink', appearance: 'dark', stageSize: 's' })
  })

  it('refuses a value that is not a choice and keeps the current one', () => {
    useSettings.getState().setTheme('pine')
    useSettings.getState().setTheme('neon' as never)
    expect(useSettings.getState().theme).toBe('pine')
  })

  it('still applies a change when storage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(readSettings()).toEqual(DEFAULT_SETTINGS)
    useSettings.getState().setTheme('dusk')
    expect(useSettings.getState().theme).toBe('dusk')
  })
})
