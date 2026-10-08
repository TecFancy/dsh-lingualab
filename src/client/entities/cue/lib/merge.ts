/**
 * Folding a Chinese subtitle track into an English one.
 *
 * Separate `.en.srt` and `.zh.srt` files are the common case for this material,
 * and the panel renders one cue list, so the two have to be joined. The join is
 * by start time with a tolerance, because the two tracks are cut independently
 * and their timestamps rarely agree to the millisecond.
 *
 * A cue with no Chinese counterpart keeps its English only: a missing translation
 * must not shift every later line by one.
 */
import type { Cue } from '../model/types.ts'

/** How far apart two starts may be and still count as the same line. */
const MATCH_TOLERANCE_SECONDS = 0.6

/**
 * Append the Chinese text of the matching cue to each English cue.
 *
 * @param english Cues from the English track, already sorted by the parser.
 * @param chinese Cues from the Chinese track.
 * @returns A new list; the inputs are not modified.
 */
export function mergeBilingual(english: readonly Cue[], chinese: readonly Cue[]): Cue[] {
  if (chinese.length === 0) return [...english]

  const sorted = [...chinese].sort((left, right) => left.start - right.start)
  let cursor = 0

  return english.map((cue) => {
    // Both lists are sorted, so the window only ever moves forward; a rescanned
    // list would still be correct but would make a 1000-cue merge quadratic.
    while (cursor < sorted.length - 1 && (sorted[cursor + 1]?.start ?? Infinity) <= cue.start) {
      cursor += 1
    }
    const candidate = sorted[cursor]
    if (candidate === undefined || Math.abs(candidate.start - cue.start) > MATCH_TOLERANCE_SECONDS) {
      return cue
    }
    return { ...cue, text: `${cue.text}\n${candidate.text}` }
  })
}
