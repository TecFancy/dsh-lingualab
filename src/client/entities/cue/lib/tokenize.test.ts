import { describe, expect, it } from 'vitest'
import { tokenizeEnglish } from './tokenize.ts'

const words = (line: string): string[] =>
  tokenizeEnglish(line)
    .filter((token) => token.word)
    .map((token) => token.text)

describe('tokenizeEnglish', () => {
  it('reassembles the line exactly', () => {
    const line = '"Hello, world!" -- she said... well-known, isn\'t it?'
    expect(
      tokenizeEnglish(line)
        .map((token) => token.text)
        .join(''),
    ).toBe(line)
  })

  it('keeps apostrophes and hyphens inside a word and drops them at the edges', () => {
    expect(words("Don't go, it's well-known 'quoted' -dash-")).toEqual([
      "Don't",
      'go',
      "it's",
      'well-known',
      'quoted',
      'dash',
    ])
  })

  it('treats a curly apostrophe like a straight one', () => {
    expect(words('We’re here')).toEqual(['We’re', 'here'])
  })

  it('keeps digits and returns nothing for a line with no words', () => {
    expect(words('Room 101')).toEqual(['Room', '101'])
    expect(tokenizeEnglish('...')).toEqual([{ text: '...', word: false }])
    expect(tokenizeEnglish('')).toEqual([])
  })
})
