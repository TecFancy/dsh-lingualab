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
import { hasCjk } from './lines.ts'

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
    const addition = chineseLinesOf(candidate.text, cue.text)
    return addition.length === 0 ? cue : { ...cue, text: `${cue.text}\n${addition}` }
  })
}

/**
 * What of a Chinese-track cue is worth appending to an English cue.
 *
 * The track is often a bilingual file (`xxx_双语.srt`) paired with a plain English
 * one, so its cues already carry the English line. Appending them whole would show
 * the English twice, so only the lines with Chinese in them are kept. A track with
 * no Chinese at all is a mislabelled one: its lines are kept except the ones the
 * English cue already says.
 */
function chineseLinesOf(chineseText: string, englishText: string): string {
  const lines = chineseText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const chinese = lines.filter(hasCjk)
  if (chinese.length > 0) return chinese.join('\n')
  const known = new Set(englishText.split('\n').map((line) => line.trim()))
  return lines.filter((line) => !known.has(line)).join('\n')
}
