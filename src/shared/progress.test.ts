/**
 * The merge rule two devices rely on, and what it does with data it should not trust.
 *
 * The rule is the whole feature: if "newest wins" is wrong in either direction, a second
 * device either loses the reader's place or overwrites a newer one with an older one.
 */
import { describe, expect, it } from 'vitest'
import {
  EMPTY_PROGRESS,
  MAX_PROGRESS_ENTRIES,
  hasNewer,
  mergeProgress,
  sameProgress,
  sanitizeProgress,
} from './progress.ts'
import type { ProgressTable } from './protocol.ts'

const NOW = 1_000_000_000_000

const table = (progress: ProgressTable['progress'] = {}, steps: ProgressTable['steps'] = {}): ProgressTable => ({ progress, steps })

describe('mergeProgress', () => {
  it('keeps the newer position for an episode both sides know', () => {
    const phone = table({ E1: { at: 100, duration: 600, updatedAt: 2000 } })
    const laptop = table({ E1: { at: 40, duration: 600, updatedAt: 1000 } })
    expect(mergeProgress(laptop, phone).progress.E1?.at).toBe(100)
    expect(mergeProgress(phone, laptop).progress.E1?.at).toBe(100)
  })

  it('unions episodes only one side has', () => {
    const merged = mergeProgress(
      table({ E1: { at: 10, duration: 60, updatedAt: 1 } }),
      table({ E2: { at: 20, duration: 60, updatedAt: 2 } }),
    )
    expect(Object.keys(merged.progress).sort()).toEqual(['E1', 'E2'])
  })

  it('treats an episode\'s steps as one unit, newest whole', () => {
    const older = table({}, { E1: { updatedAt: 1, records: { blind: { done: true, seconds: 900 } } } })
    const newer = table({}, { E1: { updatedAt: 2, records: { read: { done: true, seconds: 60 } } } })
    const merged = mergeProgress(older, newer)
    expect(Object.keys(merged.steps.E1?.records ?? {})).toEqual(['read'])
  })

  it('is stable when merged with itself or in the other order', () => {
    const a = table({ E1: { at: 10, duration: 60, updatedAt: 5 } })
    expect(sameProgress(mergeProgress(a, a), a)).toBe(true)
    const b = table({ E1: { at: 30, duration: 60, updatedAt: 9 }, E2: { at: 5, duration: 60, updatedAt: 1 } })
    expect(sameProgress(mergeProgress(a, b), mergeProgress(b, a))).toBe(true)
  })

  it('drops the oldest bookmarks past the ceiling', () => {
    const many: Record<string, { at: number; duration: number; updatedAt: number }> = {}
    for (let index = 0; index < MAX_PROGRESS_ENTRIES + 20; index += 1) many[`E${String(index)}`] = { at: 10, duration: 60, updatedAt: index }
    const merged = mergeProgress(EMPTY_PROGRESS, table(many))
    expect(Object.keys(merged.progress)).toHaveLength(MAX_PROGRESS_ENTRIES)
    expect(merged.progress.E0).toBeUndefined()
    expect(merged.progress[`E${String(MAX_PROGRESS_ENTRIES + 19)}`]).toBeDefined()
  })
})

describe('hasNewer', () => {
  it('is true for an entry the other side lacks or holds an older copy of', () => {
    const mine = table({ E1: { at: 10, duration: 60, updatedAt: 5 } })
    expect(hasNewer(mine, EMPTY_PROGRESS)).toBe(true)
    expect(hasNewer(mine, table({ E1: { at: 1, duration: 60, updatedAt: 4 } }))).toBe(true)
    expect(hasNewer(mine, table({ E1: { at: 1, duration: 60, updatedAt: 5 } }))).toBe(false)
  })
})

describe('sanitizeProgress', () => {
  it('reads anything that is not a table as nothing remembered', () => {
    for (const junk of [null, 'x', 5, [], undefined]) expect(sanitizeProgress(junk, NOW)).toEqual(EMPTY_PROGRESS)
  })

  it('drops entries of the wrong shape and keeps the good ones', () => {
    const cleaned = sanitizeProgress(
      {
        progress: {
          good: { at: 5, duration: 10, updatedAt: 1 },
          negative: { at: -1, duration: 10, updatedAt: 1 },
          text: { at: '5', duration: 10, updatedAt: 1 },
          infinite: { at: Infinity, duration: 10, updatedAt: 1 },
          '': { at: 5, duration: 10, updatedAt: 1 },
        },
        steps: {
          ok: { updatedAt: 1, records: { blind: { done: true, seconds: 5 }, '': { done: true, seconds: 1 } } },
          bad: { updatedAt: 1, records: 'nope' },
        },
      },
      NOW,
    )
    expect(Object.keys(cleaned.progress)).toEqual(['good'])
    expect(Object.keys(cleaned.steps)).toEqual(['ok'])
    expect(Object.keys(cleaned.steps.ok?.records ?? {})).toEqual(['blind'])
  })

  it('clamps a stamp from the far future so it cannot outrank every real one', () => {
    const cleaned = sanitizeProgress({ progress: { E1: { at: 5, duration: 10, updatedAt: NOW * 10 } } }, NOW)
    expect(cleaned.progress.E1?.updatedAt).toBeLessThan(NOW + 2 * 24 * 60 * 60 * 1000)
  })

  it('does not let a hostile key reach the prototype', () => {
    const cleaned = sanitizeProgress(JSON.parse('{"progress":{"__proto__":{"at":1,"duration":2,"updatedAt":3}}}'), NOW)
    expect(({} as Record<string, unknown>).at).toBeUndefined()
    expect(Object.keys(cleaned.progress).length).toBeLessThanOrEqual(1)
  })
})
