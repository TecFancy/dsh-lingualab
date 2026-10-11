// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { segmentKey } from '../../../shared/progress.ts'
import { clearProgress, fractionOf, readAllProgress, readProgress, writeProgress } from './progress.ts'
import { readSteps, writeSteps } from './steps.ts'
import { readTable, resetMigrationForTests } from './store.ts'

/** The few `localStorage` members the modules use, over a plain map. */
function installStorage(): Map<string, string> {
  const data = new Map<string, string>()
  const storage = {
    get length() {
      return data.size
    },
    key: (index: number) => [...data.keys()][index] ?? null,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
  ;(globalThis as unknown as { window: { localStorage: typeof storage } }).window = { localStorage: storage }
  return data
}

let data: Map<string, string>

beforeEach(() => {
  data = installStorage()
  resetMigrationForTests()
  // `fetch` is the sync's only way out; a host that is down must not matter to the cache.
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')))
})

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window
  vi.unstubAllGlobals()
})

describe('progress', () => {
  it('stores and reads back a bookmark', () => {
    writeProgress('E1', 120, 600, 1000)
    expect(readProgress('E1')).toEqual({ at: 120, duration: 600, updatedAt: 1000 })
  })

  it('ignores positions too early to be worth remembering', () => {
    writeProgress('E1', 1.5, 600)
    expect(readProgress('E1')).toBeNull()
  })

  it('does not bump the stamp when the position has not moved', () => {
    writeProgress('E1', 120, 600, 1000)
    writeProgress('E1', 120.2, 600, 9000)
    expect(readProgress('E1')?.updatedAt).toBe(1000)
  })

  it('tolerates a corrupt or hand-edited entry', () => {
    data.set('dsh-lingualab:progress', '{not json')
    expect(readAllProgress()).toEqual({})
    data.set('dsh-lingualab:progress', JSON.stringify({ E1: { at: 'x' }, E2: { at: 5, duration: 10, updatedAt: 1 } }))
    expect(Object.keys(readAllProgress())).toEqual(['E2'])
  })

  it('clears one episode without touching the others', () => {
    writeProgress('E1', 10, 100, 1)
    writeProgress('E2', 20, 100, 2)
    clearProgress('E1')
    expect(readProgress('E1')).toBeNull()
    expect(readProgress('E2')?.at).toBe(20)
  })

  it('keeps only the newest thousand positions', () => {
    for (let index = 0; index < 1020; index += 1) writeProgress(`E${String(index)}`, 10, 100, index + 1)
    const all = readAllProgress()
    expect(Object.keys(all)).toHaveLength(1000)
    expect(all.E0).toBeUndefined()
    expect(all.E1019).toBeDefined()
  })

  it('keeps a position per segment under its own key, apart from the episode id', () => {
    writeProgress(segmentKey('S01E01', '01_a'), 30, 60, 1)
    writeProgress(segmentKey('S01E01', '02_b'), 45, 60, 2)
    expect(readProgress(segmentKey('S01E01', '01_a'))?.at).toBe(30)
    expect(readProgress(segmentKey('S01E01', '02_b'))?.at).toBe(45)
    expect(readProgress('S01E01')).toBeNull()
  })

  it('survives storage that refuses writes', () => {
    ;(globalThis as unknown as { window: { localStorage: { setItem: () => void } } }).window.localStorage.setItem = () => {
      throw new Error('full')
    }
    expect(() => writeProgress('E1', 10, 100)).not.toThrow()
    expect(readProgress('E1')).toBeNull()
  })
})

describe('steps', () => {
  it('stores ticks per episode', () => {
    writeSteps('E1', { blind: { done: true, seconds: 61 } }, 1000)
    expect(readSteps('E1')).toEqual({ blind: { done: true, seconds: 61 } })
    expect(readSteps('E2')).toEqual({})
  })

  it('folds the per-episode keys of earlier versions into the table, once, and removes them', () => {
    data.set('dsh-lingualab:steps:E1', JSON.stringify({ blind: { done: true, seconds: 30 } }))
    data.set('dsh-lingualab:steps:E2', JSON.stringify({ read: { done: false, seconds: 5 } }))
    expect(readSteps('E1')).toEqual({ blind: { done: true, seconds: 30 } })
    expect([...data.keys()].filter((key) => key.startsWith('dsh-lingualab:steps:'))).toEqual([])
    expect(readSteps('E2')).toEqual({ read: { done: false, seconds: 5 } })
  })

  it('lets a tick made after the upgrade win over a legacy one', () => {
    data.set('dsh-lingualab:steps:E1', JSON.stringify({ blind: { done: false, seconds: 1 } }))
    data.set('dsh-lingualab:steps', JSON.stringify({ E1: { updatedAt: 5000, records: { blind: { done: true, seconds: 9 } } } }))
    expect(readSteps('E1')).toEqual({ blind: { done: true, seconds: 9 } })
  })

  it('does not choke on a legacy entry that is junk', () => {
    data.set('dsh-lingualab:steps:E1', '{nope')
    expect(readTable().steps.E1?.records ?? {}).toEqual({})
  })
})

describe('fractionOf', () => {
  it('is 0 without a bookmark or a known length, and clamps at 1', () => {
    expect(fractionOf(null)).toBe(0)
    expect(fractionOf({ at: 5, duration: 0, updatedAt: 1 })).toBe(0)
    expect(fractionOf({ at: 50, duration: 100, updatedAt: 1 })).toBe(0.5)
    expect(fractionOf({ at: 500, duration: 100, updatedAt: 1 })).toBe(1)
  })
})
