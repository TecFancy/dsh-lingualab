import { describe, expect, it } from 'vitest'
import { addWordToNote, noteHasWord, splitNote } from './words.ts'

describe('words kept in a note', () => {
  it('starts a note and appends to one', () => {
    expect(addWordToNote('', 'gonna')).toBe('[gonna]')
    expect(addWordToNote('Rachel, coffee shop', 'gonna')).toBe('Rachel, coffee shop [gonna]')
  })

  it('does not add a word twice, whatever its case', () => {
    expect(addWordToNote('[Gonna]', 'gonna')).toBe('[Gonna]')
    expect(noteHasWord('x [Gonna] y', 'GONNA')).toBe(true)
  })

  it('does not mistake plain text for a kept word', () => {
    expect(noteHasWord('gonna is slang', 'gonna')).toBe(false)
  })

  it('ignores an empty word', () => {
    expect(addWordToNote('note', '   ')).toBe('note')
  })
})

describe('splitting a note for display', () => {
  it('lifts the marked words out and keeps the rest as text', () => {
    expect(splitNote('Claire to Phil [anything] at breakfast [gonna]')).toEqual({
      words: ['anything', 'gonna'],
      text: 'Claire to Phil at breakfast',
    })
  })

  it('returns plain notes untouched and empty notes empty', () => {
    expect(splitNote('just a note')).toEqual({ words: [], text: 'just a note' })
    expect(splitNote('')).toEqual({ words: [], text: '' })
  })
})