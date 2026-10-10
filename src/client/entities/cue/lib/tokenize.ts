/**
 * Cutting an English line into words you can point at, and the gaps between them.
 *
 * Clicking a word needs a word, and a word is not whatever sits between two spaces:
 * `"Hello,"` and `don't` and `well-known` all have punctuation that belongs to the
 * sentence or to the word in different ways. The rule here is the small one: a word is
 * a run of letters and digits that may contain an apostrophe or a hyphen *between*
 * letters. Everything else is a gap, kept verbatim so the line reassembles exactly.
 */

/** One piece of a line: a word that can be clicked, or the text between words. */
export interface EnglishToken {
  readonly text: string
  /** True for a word, false for spacing and punctuation. */
  readonly word: boolean
}

/** Letters and digits, with `'`, `’` and `-` allowed between two of them. */
const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu

/** Split a line into alternating gaps and words; joining the texts gives the line back. */
export function tokenizeEnglish(line: string): EnglishToken[] {
  const tokens: EnglishToken[] = []
  let cursor = 0
  for (const match of line.matchAll(WORD)) {
    const at = match.index
    if (at > cursor) tokens.push({ text: line.slice(cursor, at), word: false })
    tokens.push({ text: match[0], word: true })
    cursor = at + match[0].length
  }
  if (cursor < line.length) tokens.push({ text: line.slice(cursor), word: false })
  return tokens
}
