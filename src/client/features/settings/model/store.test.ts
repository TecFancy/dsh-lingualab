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
    expect(parseSettings('{"theme":"paper","appearance":"dark","stageSize":"l","zhMode":"hidden","picture":"large","sideCollapsed":false}')).toEqual({
      theme: 'paper',
      appearance: 'dark',
      stageSize: 'l',
      zhMode: 'hidden',
      picture: 'large',
      sideCollapsed: false,
    })
  })

  it('falls back field by field, keeping the valid ones', () => {
    expect(parseSettings('{"theme":"neon","appearance":"light","stageSize":"xl","zhMode":"faint","picture":"huge"}')).toEqual({
      theme: 'dsh',
      appearance: 'light',
      stageSize: 'm',
      zhMode: 'dim',
      picture: 'shown',
      sideCollapsed: null,
    })
    expect(parseSettings('{"theme":"dusk","appearance":3}')).toEqual({
      theme: 'dusk',
      appearance: 'auto',
      stageSize: 'm',
      zhMode: 'dim',
      picture: 'shown',
      sideCollapsed: null,
    })
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
    expect(JSON.parse(data.get(SETTINGS_KEY) ?? 'null')).toEqual({
      theme: 'ink',
      appearance: 'dark',
      stageSize: 's',
      zhMode: 'dim',
      picture: 'shown',
      sideCollapsed: null,
    })
    expect(readSettings()).toEqual({
      theme: 'ink',
      appearance: 'dark',
      stageSize: 's',
      zhMode: 'dim',
      picture: 'shown',
      sideCollapsed: null,
    })
  })

  it('remembers a stored collapse across a reload, and has no choice for anything else', () => {
    expect(useSettings.getState().sideCollapsed).toBeNull()
    useSettings.getState().setSideCollapsed(true)
    expect(useSettings.getState().sideCollapsed).toBe(true)
    expect(JSON.parse(data.get(SETTINGS_KEY) ?? 'null')).toMatchObject({ sideCollapsed: true })
    expect(readSettings().sideCollapsed).toBe(true)
    useSettings.getState().setSideCollapsed(false)
    expect(readSettings().sideCollapsed).toBe(false)
    expect(parseSettings('{"sideCollapsed":"yes"}').sideCollapsed).toBeNull()
    expect(parseSettings('{"sideCollapsed":1}').sideCollapsed).toBeNull()
    expect(parseSettings('{"sideCollapsed":null}').sideCollapsed).toBeNull()
    expect(parseSettings('{"theme":"ink"}').sideCollapsed).toBeNull()
    expect(parseSettings('{"sideCollapsed":true,"theme":"ink"}')).toEqual({ ...DEFAULT_SETTINGS, theme: 'ink', sideCollapsed: true })
  })

  it('remembers 「中文显示」 across a reload, and refuses a mode that is not one', () => {
    expect(useSettings.getState().zhMode).toBe('dim')
    useSettings.getState().setZhMode('hidden')
    useSettings.getState().setZhMode('faint' as never)
    expect(useSettings.getState().zhMode).toBe('hidden')
    expect(readSettings().zhMode).toBe('hidden')
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

describe('the picture state', () => {
  let data: Map<string, string>

  beforeEach(() => {
    data = installStorage()
    useSettings.setState({ ...DEFAULT_SETTINGS, pictureRestore: null })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts as shown, and V cycles it shown, large, hidden and round again, remembering each', () => {
    expect(useSettings.getState().picture).toBe('shown')
    const seen: string[] = []
    for (let step = 0; step < 4; step += 1) {
      useSettings.getState().cyclePicture()
      seen.push(useSettings.getState().picture)
      expect(JSON.parse(data.get(SETTINGS_KEY) ?? 'null').picture).toBe(useSettings.getState().picture)
    }
    expect(seen).toEqual(['large', 'hidden', 'shown', 'large'])
    expect(readSettings().picture).toBe('large')
  })

  it('refuses a value that is not a state', () => {
    useSettings.getState().setPicture('large')
    useSettings.getState().setPicture('wide' as never)
    expect(useSettings.getState().picture).toBe('large')
  })

  it('switches to large when the blind-watch timer starts, once, and puts the state back when it stops', () => {
    useSettings.getState().setPicture('hidden')
    expect(useSettings.getState().blindStarted()).toBe(true)
    expect(useSettings.getState().picture).toBe('large')
    // Starting again (a second tick of the same timer, a re-render) switches nothing more.
    expect(useSettings.getState().blindStarted()).toBe(false)
    useSettings.getState().blindEnded()
    expect(useSettings.getState().picture).toBe('hidden')
    expect(useSettings.getState().pictureRestore).toBeNull()
    expect(readSettings().picture).toBe('hidden')
  })

  it('does not switch, and so does not restore, when the picture is large already', () => {
    useSettings.getState().setPicture('large')
    expect(useSettings.getState().blindStarted()).toBe(false)
    useSettings.getState().blindEnded()
    expect(useSettings.getState().picture).toBe('large')
  })

  it('does not put anything back over a choice the reader made after the switch', () => {
    useSettings.getState().blindStarted()
    useSettings.getState().cyclePicture()
    expect(useSettings.getState().picture).toBe('hidden')
    useSettings.getState().blindEnded()
    expect(useSettings.getState().picture).toBe('hidden')
  })

  it('undoes the switch with a plain choice of the state from before', () => {
    useSettings.getState().blindStarted()
    const before = useSettings.getState().pictureRestore
    expect(before).toBe('shown')
    useSettings.getState().setPicture(before ?? 'shown')
    expect(useSettings.getState().picture).toBe('shown')
    useSettings.getState().blindEnded()
    expect(useSettings.getState().picture).toBe('shown')
  })

  it('does not remember what the steps will put back', () => {
    useSettings.getState().blindStarted()
    expect(Object.keys(JSON.parse(data.get(SETTINGS_KEY) ?? '{}'))).toEqual([
      'theme',
      'appearance',
      'stageSize',
      'zhMode',
      'picture',
      'sideCollapsed',
    ])
  })
})
