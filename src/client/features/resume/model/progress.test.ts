// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearProgress, fractionOf, readAllProgress, readProgress, writeProgress } from './progress.ts'

/** The few `localStorage` members the module uses, over a plain map. */
function installStorage(): Map<string, string> {
  const data = new Map<string, string>()
  const storage = {
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
})

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window
})

describe('progress', () => {
  it('stores and reads back a bookmark', () => {
    writeProgress('E1', 120, 600, 1000)
    expect(readProgress('E1')).toEqual({ at: 120, duration: 600, updatedAt: 1000 })
  })

  it('ignores a position too early to be worth continuing from', () => {
    writeProgress('E1', 1.5, 600)
    expect(readProgress('E1')).toBeNull()
  })

  it('reads as empty when the stored value is corrupt', () => {
    data.set('dsh-lingualab:progress', '{not json')
    expect(readAllProgress()).toEqual({})
    data.set('dsh-lingualab:progress', JSON.stringify({ E1: { at: 'x' }, E2: { at: 5, duration: 10, updatedAt: 1 } }))
    expect(Object.keys(readAllProgress())).toEqual(['E2'])
  })

  it('forgets one episode and keeps the others', () => {
    writeProgress('E1', 10, 100, 1)
    writeProgress('E2', 20, 100, 2)
    clearProgress('E1')
    expect(readProgress('E1')).toBeNull()
    expect(readProgress('E2')?.at).toBe(20)
  })

  it('keeps only the most recent hundred', () => {
    for (let index = 0; index < 120; index += 1) writeProgress(`E${String(index)}`, 10, 100, index)
    const all = readAllProgress()
    expect(Object.keys(all)).toHaveLength(100)
    expect(all.E119).toBeDefined()
    expect(all.E0).toBeUndefined()
  })

  it('does not throw when storage is unavailable', () => {
    delete (globalThis as unknown as { window?: unknown }).window
    expect(() => writeProgress('E1', 10, 100)).not.toThrow()
    expect(readProgress('E1')).toBeNull()
  })
})

describe('fractionOf', () => {
  it('is zero without a bookmark or a known length, and clamped to one', () => {
    expect(fractionOf(null)).toBe(0)
    expect(fractionOf({ at: 5, duration: 0, updatedAt: 1 })).toBe(0)
    expect(fractionOf({ at: 50, duration: 100, updatedAt: 1 })).toBe(0.5)
    expect(fractionOf({ at: 500, duration: 100, updatedAt: 1 })).toBe(1)
  })
})
