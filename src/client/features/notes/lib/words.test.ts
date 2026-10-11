import { describe, expect, it } from 'vitest'
import { addWordToNote, noteHasWord, removeWordFromNote, splitNote } from './words.ts'

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

  it('keeps the line breaks of a note that runs over several lines', () => {
    expect(splitNote('prove it  连读\n语气：安慰 [prove] [to them]')).toEqual({
      words: ['prove', 'to them'],
      text: 'prove it 连读\n语气：安慰',
    })
    expect(splitNote('one\n\n\n\ntwo \n three')).toEqual({ words: [], text: 'one\n\ntwo\nthree' })
    expect(splitNote('[a]\ntext')).toEqual({ words: ['a'], text: 'text' })
  })

  it('returns plain notes untouched and empty notes empty', () => {
    expect(splitNote('just a note')).toEqual({ words: [], text: 'just a note' })
    expect(splitNote('')).toEqual({ words: [], text: '' })
  })
})
describe('taking a word back out of a note', () => {
  it('removes only the marker, whatever its case, and keeps the text around it', () => {
    expect(removeWordFromNote('Claire [gonna] at breakfast', 'Gonna')).toBe('Claire at breakfast')
    expect(removeWordFromNote('[gonna]', 'gonna')).toBe('')
    expect(removeWordFromNote('note [her skirt]', 'her skirt')).toBe('note')
    expect(removeWordFromNote('[a] [b]', 'a')).toBe('[b]')
  })

  it('leaves a note without the word, and plain text that matches it, alone', () => {
    expect(removeWordFromNote('gonna is slang', 'gonna')).toBe('gonna is slang')
    expect(removeWordFromNote('[gonna]', '  ')).toBe('[gonna]')
  })

  it('keeps the lines of a note that has several', () => {
    expect(removeWordFromNote('first line\n[gonna] second line', 'gonna')).toBe('first line\nsecond line')
    expect(removeWordFromNote('first line [gonna]\nsecond line', 'gonna')).toBe('first line\nsecond line')
    expect(removeWordFromNote('first\nsecond [gonna]', 'gonna')).toBe('first\nsecond')
    expect(removeWordFromNote('first\n[gonna]', 'gonna')).toBe('first')
  })

  it('keeps a phrase as one marker', () => {
    expect(addWordToNote('', 'her skirt')).toBe('[her skirt]')
    expect(splitNote('[her skirt] [get down here]').words).toEqual(['her skirt', 'get down here'])
  })
})
