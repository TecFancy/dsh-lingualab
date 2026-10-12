/**
 * The review list: what is left to review across the library, in the order it will be heard.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { NotePhrase } from '../../../../shared/protocol.ts'
import { writeNotes } from '../../../entities/note/index.ts'
import { EMPTY_STATE, fileEpisodeIdFor, withNotes } from '../../../entities/open-state/index.ts'
import { makeTempDir } from '../../../shared/testing/index.ts'
import { readReview } from './review.ts'

let root = ''

beforeEach(() => {
  root = makeTempDir('lingualab-review-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** A folder episode with the given audio files. */
function folder(id: string, audio: readonly string[] = ['audio.mp3']): void {
  mkdirSync(join(root, id), { recursive: true })
  for (const name of audio) writeFileSync(join(root, id, name), 'x')
}

const phrase = (at: number, over: Partial<NotePhrase> = {}): NotePhrase => ({
  at,
  text: `line ${String(at)}`,
  zh: '',
  note: '',
  tags: [],
  done: false,
  ...over,
})

describe('readReview', () => {
  it('lists the sentences not graded 「记住了」, episode by episode in library order', () => {
    folder('S01E02')
    folder('S01E01')
    folder('S01E03')
    writeNotes(root, 'S01E02', [phrase(40), phrase(5, { done: true }), phrase(12, { tags: ['hard'] })])
    writeNotes(root, 'S01E01', [phrase(7, { tags: ['review'] })])
    writeNotes(root, 'S01E03', [phrase(1, { done: true })])

    const review = readReview(root)
    expect(review.ok).toBe(true)
    expect(review.total).toBe(3)
    expect(review.episodes.map((entry) => entry.episode)).toEqual(['S01E01', 'S01E02'])
    expect(review.episodes[1]?.phrases.map((item) => item.at)).toEqual([12, 40])
    expect(review.episodes[1]).toMatchObject({ title: 'S01E02', kind: 'folder', segments: [] })
  })

  it('orders a segmented episode by segment, then time, and fills in the first segment', () => {
    folder('S02E01', ['01_kitchen.mp3', '02_field.mp3'])
    writeNotes(root, 'S02E01', [
      phrase(3, { segment: '02_field' }),
      phrase(9, { segment: '01_kitchen' }),
      phrase(1, { segment: '02_field' }),
    ])
    const [entry] = readReview(root).episodes
    expect(entry?.segments).toEqual(['01_kitchen', '02_field'])
    expect(entry?.phrases.map((item) => [item.segment, item.at])).toEqual([
      ['01_kitchen', 9],
      ['02_field', 1],
      ['02_field', 3],
    ])
  })

  it('takes a loose file episode from the plugin state, after the folders', () => {
    folder('S01E01')
    writeNotes(root, 'S01E01', [phrase(2)])
    const loose = join(root, 'extra.mp3')
    writeFileSync(loose, 'x')
    const state = withNotes(EMPTY_STATE, fileEpisodeIdFor(loose), [phrase(8), phrase(3, { done: true })])

    const review = readReview(root, state)
    expect(review.episodes.map((entry) => entry.kind)).toEqual(['folder', 'file'])
    expect(review.episodes[1]?.phrases.map((item) => item.at)).toEqual([8])
    expect(review.total).toBe(2)
  })

  it('is empty, not an error, for a library with nothing kept', () => {
    folder('S01E01')
    expect(readReview(root)).toEqual({ ok: true, reason: null, episodes: [], total: 0 })
  })

  it('says why when the library cannot be read', () => {
    const review = readReview(join(root, 'missing'))
    expect(review.ok).toBe(false)
    expect(review.reason).not.toBeNull()
    expect(review.episodes).toEqual([])
  })
})
