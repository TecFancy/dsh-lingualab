// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { notedIndexesOf, phraseOfCue, stagePhraseOf, toggledNote } from './stage-notes.ts'

const cue = (start: number, text: string): Cue => ({ start, end: start + 2, text })

const phrase = (at: number, text: string, over: Partial<NotePhrase> = {}): NotePhrase => ({
  at,
  text,
  zh: '',
  note: '',
  tags: [],
  done: false,
  ...over,
})

const cues = [cue(10.2, 'First line'), cue(12.5, 'Second line\n第二句'), cue(14.9, 'Third line')]

describe('phraseOfCue', () => {
  it('keeps a cue with its English, its Chinese gloss and an empty note', () => {
    expect(phraseOfCue(cues[1] as Cue, null)).toEqual({
      at: 12.5,
      text: 'Second line',
      zh: '第二句',
      note: '',
      tags: [],
      done: false,
      segment: undefined,
    })
  })

  it('records the segment it is in', () => {
    expect(phraseOfCue(cues[0] as Cue, '02_b').segment).toBe('02_b')
  })

  it('starts the note with what it is given', () => {
    expect(phraseOfCue(cues[0] as Cue, null, '[line]').note).toBe('[line]')
  })
})

describe('notedIndexesOf', () => {
  it('marks the cues whose sentence is kept, by whole second and English', () => {
    // Stored with whole seconds: 10 for 10.2, and 12 for 12.5.
    const kept = [phrase(10, 'First line'), phrase(12, 'Second line')]
    expect([...notedIndexesOf(cues, kept, null)]).toEqual([0, 1])
  })

  it('does not mark a cue whose second matches but whose English does not', () => {
    expect([...notedIndexesOf(cues, [phrase(10, 'Another line')], null)]).toEqual([])
  })

  it('does not mark a cue of another segment', () => {
    const kept = [phrase(10, 'First line', { segment: '01_a' })]
    expect([...notedIndexesOf(cues, kept, '02_b')]).toEqual([])
    expect([...notedIndexesOf(cues, kept, '01_a')]).toEqual([0])
  })

  it('marks nothing without cues or without kept phrases', () => {
    expect(notedIndexesOf([], [phrase(10, 'First line')], null).size).toBe(0)
    expect(notedIndexesOf(cues, [], null).size).toBe(0)
  })
})

describe('stagePhraseOf', () => {
  const stored = [phrase(30, 'Elsewhere'), phrase(12, 'Second line', { note: 'n' })]

  it('finds the kept phrase of the sentence on stage, and where it is stored', () => {
    expect(stagePhraseOf(cues, 1, stored, null)).toEqual({ index: 1, phrase: stored[1] })
  })

  it('is null when the sentence on stage is not kept', () => {
    expect(stagePhraseOf(cues, 0, stored, null)).toBeNull()
  })

  it('is null when no sentence is on stage', () => {
    expect(stagePhraseOf(cues, 9, stored, null)).toBeNull()
    expect(stagePhraseOf([], 0, stored, null)).toBeNull()
  })

  it('does not take a phrase of another segment for the one on stage', () => {
    const other = [phrase(12, 'Second line', { segment: '01_a' })]
    expect(stagePhraseOf(cues, 1, other, '02_b')).toBeNull()
    expect(stagePhraseOf(cues, 1, other, '01_a')).toEqual({ index: 0, phrase: other[0] })
  })
})

describe('toggledNote', () => {
  it('puts a word in when the note does not hold it', () => {
    expect(toggledNote('', 'skirt')).toBe('[skirt]')
    expect(toggledNote('who said it', 'skirt')).toBe('who said it [skirt]')
  })

  it('takes a word out when the note holds it, whatever its case', () => {
    expect(toggledNote('who said it [skirt]', 'SKIRT')).toBe('who said it')
  })
})
